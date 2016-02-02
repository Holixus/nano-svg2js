#!/usr/bin/env node
"use strict";

var svg2js = require('nano-svg2js'),
    fs = require('fs'),
    json = require('nano-json'),
    opts = {
			infile:       'source.svg',
			outfile:      ''
		};

(function () {
	var getopt = new (require('node-getopt'))([
	    	[ 'P', 'pack',           'pack js tree' ],
	    	[ 'S', 'stringify',      'use JSON.stringify()' ],
	    	[ 'J', 'join',           'join symbols and gradients' ],
	    	[ 'I', 'ids=',           'rename ids with prefix' ],
	    	[ 'h', 'help',           'print usage instruction' ]
	    ]);

	getopt.setHelp("\
svg-to-js.js v1.0 (c) Vladimir Antonov 2015-2016\n\
Usage: node svg-to-js.js [OPTIONS] source_file [destination_file]\n\
Options:\n\
[[OPTIONS]]\n");

	getopt.bindHelp();
	var opt = getopt.parseSystem();

	for (var id in opt.options)
		if (opt.options[id])
			opts[id] = opt.options[id];

	if (opts.ids === true)
		opts.ids = '$';

	var argv = opt.argv;

	if (argv.length)
		opts.infile = argv[0];
	else {
		getopt.showHelp();
		process.exit(1);
	}

	opts.outfile = argv.length > 1 ? argv[1] : opts.infile.replace(/\.svg$/, '.js');
})();


function js2str(o, tab) {
	var out = '';
	if (!tab)
		tab = '';
	out += '[\n\t'+tab;
	for (var i = 0, n = o.length; i < n; i += 2) {
		out += json.js2str(o[i]) + ', ';
		var v = o[i+1];
		out += ((typeof v !== 'object') ? json.js2str(v) : js2str(v, tab+'\t'));
		if (i < n - 2)
			out += ',\n\t'+tab;
	}
	out += '\n'+tab+']';
	return out;
}

(new Promise(function (res, rej) {
	fs.readFile(opts.infile, 'utf8', function (e, t) {
		if (e)
			rej(e);
		else
			res(t);
	})
})).then(function (svg) {
	return svg2js.parseSVG(svg);
}).then(function (js) {
	return opts.ids ? svg2js.optimizeIds(js, opts.ids) : js;
}).then(function (js) {
	return opts.join ? svg2js.optimizeJSVG(js) : js;
}).then(function (js) {
	return opts.pack ? svg2js.packJSVG(js) : js;
}).then(function (js) {
	return opts.stringify ? JSON.stringify(js) : js2str(js);
}).then(function (text) {
	return new Promise(function (res, rej) {
		fs.writeFile(opts.outfile, text, { encoding: 'utf8' }, function (e) {
			if (e)
				rej(e);
			else
				res();
		});
	});
}).catch(function (e) {
	console.error(e);
});
