var jsvg = require('../index.js'),
    assert = require('core-assert');

var timer = function (ms, v) {
	return new Promise(function (resolve, reject) {
		var to = setTimeout(function () {
				resolve(v);
			}, ms);
		return { cancel: function () {
			clearTimeout(to);
		}};
	});
};

function ts(a, radix, deep) {
	switch (typeof a) {
	case 'object':
		if (a instanceof Array) {
			var o = [];
			for (var i = 0, n = a.length; i < n; ++i)
				o[i] = ts(a[i], radix, 1);
			return deep ? '['+o.join(',')+']' : o.join(',');
		} else {
			if (a === null)
				return 'null';
			var o = [];
			for (var id in a)
				o.push(id+':'+ts(a[id], radix, 1));
			return '{' + o.join(',') + '}';
		}
		break;
	case 'string':
		var qc = 0, dqc = 0;
		for (var i = 0, n = a.length; i < n; ++i)
			switch (a.charAt(i)) {
			case "'": ++qc; break;
			case '"': ++dqc; break;
			}
		if (qc <= dqc) {
			return '"' + a.replace(/["\t\n\r]/g, function (m) { //"
				switch (m) {
				case '"':	return '\\"';
				case '\t':  return '\\t';
				case '\n':  return '\\n';
				case '\r':  return '\\r';
				default:    return m;
				}
			}) + '"';
		} else {
			return "'" + a.replace(/['\t\n\r]/g, function (m) { //'
				switch (m) {
				case "'":	return "\\'";
				case '\t':  return '\\t';
				case '\n':  return '\\n';
				case '\r':  return '\\r';
				default:    return m;
				}
			}) + "'";
		}
	case 'number':
		switch (radix) {
		case 2:
		case undefined:
		default:
			return '0b'+a.toString(2);
		case 10:
			return a.toString(10);
		case 16:
			return '0x'+a.toString(16);
		case 8:
			return '0o'+a.toString(8);
		}
	case 'undefined':
		return 'undefined';
	case 'function':
	case 'boolean':
		return a.toString();
	}
}

function massive(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+ts(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i], pairs[i+1]);
	});
}

function massive_reversed(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+ts(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i+1], pairs[i]);
	});
}

suite('SVG to JS', function () {

	test('parseSVG <arrows>', function (done) {
		var svg ='\
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 15 15">\n\
	<symbol viewBox="0 0 15 15" id="arrow-up">\n\
		<path d="M7.5 1c-.12 0-.24.053-.332.16L3.375 6.6c-.182.215-.1.39.18.39H5.14c.28 0 .51.23.51.51l.004 1.666v4.314l-.002.012c0 .28.238.508.518.508h2.678c.28 0 .51-.23.51-.51L9.35 7.5c0-.28.23-.51.51-.51h1.585c.28 0 .362-.175.18-.388L7.832 1.16C7.742 1.053 7.62 1 7.5 1z"/>\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-left-up">\n\
		<use xlink:href="#arrow-up" transform="rotate(-45 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-left">\n\
		<use xlink:href="#arrow-up" transform="rotate(-90 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-left-down">\n\
		<use xlink:href="#arrow-up" transform="rotate(-135 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-right-up">\n\
		<use xlink:href="#arrow-up" transform="rotate(45 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-right">\n\
		<use xlink:href="#arrow-up" transform="rotate(90 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-right-down">\n\
		<use xlink:href="#arrow-up" transform="rotate(135 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrow-down">\n\
		<use xlink:href="#arrow-up" transform="rotate(180 7.5 7.5)" />\n\
	</symbol>\n\
	<symbol viewBox="0 0 15 15" id="arrows-horizon">\n\
		<path d="M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z"/>\n\
	</symbol>\n\
</svg>\n';

		jsvg.parseSVG(svg).then(function (js) {
			console.log(js);
			done();
		}, done);
	});

});
