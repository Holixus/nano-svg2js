"use strict";

var exports = module.exports;

var sax = require('sax');

exports.optimizeIds = function packIds(js, prefix) {
	function deep(tag, o, cb) {
		for (var i = 0, n = o.length; i < n; i += 2) {
			var t = o[i+1];
			if (typeof t === 'string') {
				o[i+1] = cb(o[i], t, tag); // attr, value
			} else { // tag content
				deep(o[i], t, cb);
			}
		}
	}

	var ids = {},
	    symbols = {};

	if (!prefix)
		prefix = '';

	deep('', js, function (id, value, tag) {
		if (id === 'id') {
			if (tag === 'symbol') // don't rename symbols ids
				symbols[value] = value;
			ids[value] = value;
		}
		return value;
	});

	var i = 0;

	for (var id in ids) {
		if (!symbols[id])
			ids[id] = prefix+ (++i).toString(36);
	}

	deep('', js, function (id, value) {
		if (id === 'id')
			return ids[value];
		return value.replace(/url\(#([^)]+)\)/g, function (m, id) {
			return 'url(#'+ids[id]+')';
		});
	});
	return js;
};

exports.packJSVG = function packJSML(js) {
	var strs = {},
	    voc = {},
	    last = 0;

	function deep(o, cb, pair) {
		for (var i = 0, n = o.length; i < n; i += 2) {
			var t = o[i+1];
			if (typeof t === 'string') {
				o[i] = cb(o[i]); // id
				o[i+1] = cb(t);  // value
			} else { // tag content
				o[i] = cb(o[i]); // tag
				deep(t, cb);
			}
		}
	}

	deep(js, function (t) {
		if (t.length < 1)
			return t;
		if (!strs[t])
			strs[t] = 0
		++strs[t];
		return t;
	});

	var a = [];
	for (var t in strs)
		if (strs[t] > 1)
			a.push([t, strs[t]]);

	if (a.length) {
		a.sort(function (l, r) {
			return l[1] === r[1] ? 0 : (l[1] < r[1] ? 1 : -1);
		});

		//console.log(a);

		for (var i = 0, n = a.length; i < n; ++i)
			voc[a[i] = a[i][0]] = last++;

		deep(js, function (t) {
			return t in voc ? voc[t] : t;
		});

		js.unshift('[voc]', a.join('\t'));
	}

	return js;
};

exports.optimizeJSVG = function optimizeJSML(o) {
	var symbols = {};

	function getSymbol(o) {
		var s = {};
		for (var i = 0, n = o.length; i < n; i += 2) {
			switch (o[i]) {
			default:
				continue;
			case 'id':
			case 'viewBox':
				s[o[i]] = o[i+1];
				o.splice(i, 2);
				i -= 2;
			}
		}
		if (s.id) {
			s.dom = o;
			return s;
		} // else remove symbole without id
	}

	function getStop(o) {
		var s = {};
		for (var i = 0, n = o.length; i < n; i += 2) {
			switch (o[i]) {
			default:
				continue;
			case 'offset':
			case 'stop-color':
			case 'stop-opacity':
				s[o[i].replace(/^stop-/, '')] = o[i+1];
				o.splice(i, 2);
				i -= 2;
			}
		}
		if (s.color) {
			if (o.length)
				s.dom = o;
			return s;
		} // else remove stop without color
	}

	function getGradient(o) {
		var key,
		    s = { stops: [] },
		    line = { x1:'0', y1:'0', x2:'', y2:'' },
		    rad = { cx:'0', cy:'0', r:'0' };
		for (var i = 0, n = o.length; i < n; i += 2) {
			var key = o[i],
			    value = o[i+1];
			switch ((key = o[i])) {
			default:
				continue;
			case 'stop':
				var stop = getStop(value);
				if (!stop)
					continue;
				s.stops.push(stop.offset, stop.color+(stop.opacity ? ','+stop.opacity : ''));
				break;
			case 'cx':
			case 'cy':
			case 'fx':
			case 'fy':
			case 'r':
				rad[key] = value;
				s.rad = rad;
				break;
			case 'x1':
			case 'x2':
			case 'y1':
			case 'y2':
				line[key] = value;
				s.line = line;
				break;
			case 'id':
			case 'gradientUnits':
				s[key] = value;
			}
			o.splice(i, 2);
			i -= 2;
		}
		if (s.id) {
			if (s.line)
				o.unshift('line', [ s.line.x1, s.line.y1, s.line.x2 || s.line.x1, s.line.y2 || s.line.y1 ].join(' '));
			if (s.rad)
				o.unshift('rad', [ s.rad.cx, s.rad.cy, s.rad.r, s.rad.fx || '', s.rad.fy || '' ].join(' '));
			delete s.line;
			if (s.stops.length) 
				o.push('stops', s.stops);
			s.dom = o;
			return s;
		} // else remove gradient without id
	}

	function getFilter(o) {
		var key, f = { box: { x:'0', y:'0', width:'0', height:'0' } };
		for (var i = 0, n = o.length; i < n; i += 2) {
			var key = o[i],
			    value = o[i+1];
			switch ((key = o[i])) {
			default:
				continue;
			case 'x':
			case 'y':
			case 'width':
			case 'height':
				f.box[key] = value;
				break;
			case 'id':
			case 'gradientUnits':
				f[key] = value;
			}
			o.splice(i, 2);
			i -= 2;
		}
		if (f.id) {
			o.unshift('box', [ f.box.x, f.box.y, f.box.width, f.box.height ].join(' '));
			delete f.box;
			f.dom = o;
			return f;
		} // else remove filter without id
	}

	function optimizeDefs(o) {
		var lgs = {},
		    rgs = {},
		    filters = {},
		    tag;
		for (var i = 0, n = o.length; i < n; i += 2) {
			switch ((tag = o[i])) {
			default:
				continue;
			case 'filter':
				var f = getFilter(o[i+1]);
				if (!f)
					break;
				filters[f.id] = f;
				break;
			case 'linearGradient':
			case 'radialGradient':
				var g = getGradient(o[i+1]);
				if (!g)
					break;
				(tag.charAt(0) === 'l' ? lgs : rgs)[g.id] = g;
			}
			o.splice(i, 2);
			i -= 2;
		}
		function putFilters(tag, fs) {
			for (var id in fs) {
				var out = [];
				o.push(tag, out);
				for (var id in fs) {
					var f = fs[id];
					out.push(f.id, f.dom);
				}
				break;
			}
		}
		function putGradients(tag, gs) {
			for (var id in gs) {
				var out = [];
				o.push(tag, out);
				var by_units = { '': [] };
				for (var id in gs) {
					var g = gs[id],
					    units = g.gradientUnits || '';
					(by_units[units] || (by_units[units] = [])).push(g);
					delete g.gradientUnits;
				}
				for (var u in by_units) {
					var gs = by_units[u];
					if (u)
						out.push('gradientUnits', u);
					for (var i = 0, n = gs.length; i < n; ++i)
						out.push(gs[i].id, gs[i].dom);
				}
				break;
			}
		}
		putFilters('filters', filters);
		putGradients('linearGradients', lgs);
		putGradients('radialGradients', rgs);
	}

	for (var i = 0, n = o.length; i < n; i += 2) {
		switch (o[i]) {
		case 'symbol':
			var s = getSymbol(o[i+1]);
			if (s)
				symbols[s.id] = s;
			o.splice(i, 2);
			i -= 2;
			break;
		case 'defs':
			optimizeDefs(o[i+1]);
		}
	}
	for (var id in symbols) {
		var out = [];
		o.push('symbols', out);
		var by_viewBox = { '': [] };
		for (var id in symbols) {
			var s = symbols[id],
			    box = s.viewBox;
			(by_viewBox[box] || (by_viewBox[box] = [])).push(s);
			delete s.viewBox;
		}
		for (var vb in by_viewBox) {
			var ss = by_viewBox[vb];
			if (vb)
				out.push('viewBox', vb);
			for (var i = 0, n = ss.length; i < n; ++i)
				out.push(ss[i].id, ss[i].dom);
		}
		break;
	}
	return o;
};

exports.parseSVG = function parse(xml) {
	var js = [],
	    parser = sax.parser(true),
	    top = js,
	    stack = [ top ];

	function pop() {
		stack.pop();
		top = stack[stack.length - 1];
	}
	function push(o) {
		stack.push(top = o);
		return o;
	}

	parser.onopentag = function (tag) {
		top.push(tag.name, push([]));
		var as = tag.attributes;
		for (var n in as)
			if (n !== 'xmlns')
				top.push(n, as[n]);
	};

	parser.onattribute = function (a) {
		//top.push(a.name, a.value);
	};

	parser.ontext = function (t) {
		if (t.trim())
			top.push('', t);
	};

	parser.onclosetag = function () {
		pop();
	};

	var p = new Promise(function (resolve, reject) {
		parser.onend = function () {
			resolve(js[1]);
		};
		parser.onerror = reject;
	});

	parser.write(xml).close();
	return p;
};
