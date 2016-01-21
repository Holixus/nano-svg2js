var jsvg = require('../index.js'),
    assert = require('core-assert'),
    clone = require('clone'),
    jso = require('nano-json');

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

var svg_arrows ='\
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
</svg>\n',
    js_arrows = 
[ 'xmlns:xlink', 'http://www.w3.org/1999/xlink', 'viewBox', '0 0 15 15',
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-up',
		'path', [ 'd', 'M7.5 1c-.12 0-.24.053-.332.16L3.375 6.6c-.182.215-.1.39.18.39H5.14c.28 0 .51.23.51.51l.004 1.666v4.314l-.002.012c0 .28.238.508.518.508h2.678c.28 0 .51-.23.51-.51L9.35 7.5c0-.28.23-.51.51-.51h1.585c.28 0 .362-.175.18-.388L7.832 1.16C7.742 1.053 7.62 1 7.5 1z' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left-up',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-45 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-90 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-135 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right-up',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(45 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(90 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(135 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(180 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrows-horizon',
		'path', [ 'd', 'M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z' ] ] ],
    js_arrows_oids = [ 'xmlns:xlink', 'http://www.w3.org/1999/xlink', 'viewBox', '0 0 15 15',
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-up',
		'path', [ 'd', 'M7.5 1c-.12 0-.24.053-.332.16L3.375 6.6c-.182.215-.1.39.18.39H5.14c.28 0 .51.23.51.51l.004 1.666v4.314l-.002.012c0 .28.238.508.518.508h2.678c.28 0 .51-.23.51-.51L9.35 7.5c0-.28.23-.51.51-.51h1.585c.28 0 .362-.175.18-.388L7.832 1.16C7.742 1.053 7.62 1 7.5 1z' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left-up',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-45 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-90 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-left-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-135 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right-up',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(45 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(90 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-right-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(135 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrow-down',
		'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(180 7.5 7.5)' ] ],
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrows-horizon',
		'path', [ 'd', 'M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z' ] ] ],
    js_arrows_o = [ 'xmlns:xlink', 'http://www.w3.org/1999/xlink', 'viewBox', '0 0 15 15',
	'symbols', [ 'viewBox', '0 0 15 15',
		'arrow-up', [
			'path', [ 'd', 'M7.5 1c-.12 0-.24.053-.332.16L3.375 6.6c-.182.215-.1.39.18.39H5.14c.28 0 .51.23.51.51l.004 1.666v4.314l-.002.012c0 .28.238.508.518.508h2.678c.28 0 .51-.23.51-.51L9.35 7.5c0-.28.23-.51.51-.51h1.585c.28 0 .362-.175.18-.388L7.832 1.16C7.742 1.053 7.62 1 7.5 1z' ] ],
		'arrow-left-up', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-45 7.5 7.5)' ] ],
		'arrow-left', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-90 7.5 7.5)' ] ],
		'arrow-left-down', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(-135 7.5 7.5)' ] ],
		'arrow-right-up', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(45 7.5 7.5)' ] ],
		'arrow-right', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(90 7.5 7.5)' ] ],
		'arrow-right-down', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(135 7.5 7.5)' ] ],
		'arrow-down', [
			'use', [ 'xlink:href', '#arrow-up', 'transform', 'rotate(180 7.5 7.5)' ] ],
		'arrows-horizon', [
			'path', [ 'd', 'M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z' ] ] ] ],
    js_arrows_p = [ '[voc]', 'use\txlink:href\t#arrow-up\ttransform\tviewBox\t0 0 15 15\tpath\td', 'xmlns:xlink', 'http://www.w3.org/1999/xlink', 4, 5,
	'symbols', [ 4, 5,
		'arrow-up', [
			6, [ 7, 'M7.5 1c-.12 0-.24.053-.332.16L3.375 6.6c-.182.215-.1.39.18.39H5.14c.28 0 .51.23.51.51l.004 1.666v4.314l-.002.012c0 .28.238.508.518.508h2.678c.28 0 .51-.23.51-.51L9.35 7.5c0-.28.23-.51.51-.51h1.585c.28 0 .362-.175.18-.388L7.832 1.16C7.742 1.053 7.62 1 7.5 1z' ] ],
		'arrow-left-up', [
			0, [ 1, 2, 3, 'rotate(-45 7.5 7.5)' ] ],
		'arrow-left', [
			0, [ 1, 2, 3, 'rotate(-90 7.5 7.5)' ] ],
		'arrow-left-down', [
			0, [ 1, 2, 3, 'rotate(-135 7.5 7.5)' ] ],
		'arrow-right-up', [
			0, [ 1, 2, 3, 'rotate(45 7.5 7.5)' ] ],
		'arrow-right', [
			0, [ 1, 2, 3, 'rotate(90 7.5 7.5)' ] ],
		'arrow-right-down', [
			0, [ 1, 2, 3, 'rotate(135 7.5 7.5)' ] ],
		'arrow-down', [
			0, [ 1, 2, 3, 'rotate(180 7.5 7.5)' ] ],
		'arrows-horizon', [
			6, [ 7, 'M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z' ] ] ] ],
    svg_storage = '\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">\n\
	<defs>\n\
		<filter id="folder-shadow-blur" width="1.234" height="1.255" x="-.117" y="-.128">\n\
			<feGaussianBlur stdDeviation=".585"/>\n\
		</filter>\n\
		<linearGradient id="folder-back-gradient" gradientUnits="userSpaceOnUse" x1="11.5" y1="11" x2="11" y2="4">\n\
			<stop stop-color="#0062ff" offset="0"/>\n\
			<stop stop-color="#b4d0ff" offset="1"/>\n\
		</linearGradient>\n\
		<linearGradient id="folder-paper-gradient" gradientUnits="userSpaceOnUse" x1="4.268" y1="5.732" x2="4.509" y2="7.652">\n\
			<stop stop-color="#fff" offset="0"/>\n\
			<stop stop-color="#dcdcdc" offset=".584"/>\n\
			<stop stop-color="#a9a9a9" offset="1"/>\n\
		</linearGradient>\n\
		<linearGradient id="folder-front-gradient" gradientUnits="userSpaceOnUse" x1="10" y1="4" x2="6" y2="18">\n\
			<stop stop-color="#0062ff" offset="0"/>\n\
			<stop stop-color="#87b4ff" offset=".446"/>\n\
			<stop stop-color="#fff" stop-opacity="1" offset="1"/>\n\
		</linearGradient>\n\
		<linearGradient id="linearGradient6557" gradientUnits="userSpaceOnUse" x1="11" y1="18" y2="-3">\n\
			<stop stop-color="#001138" offset="0"/>\n\
			<stop stop-color="#edf3ff" offset="1"/>\n\
		</linearGradient>\n\
		<linearGradient id="linearGradient6557-93" gradientUnits="userSpaceOnUse" x1="14.5" y1="12.5" x2="-.5" y2="4">\n\
			<stop stop-color="#001138" offset="0"/>\n\
			<stop stop-color="#e9f0ff" offset="1"/>\n\
		</linearGradient>\n\
		<linearGradient id="linearGradient6701" gradientUnits="userSpaceOnUse" x1="8" y1="17" x2="5" y2="2">\n\
			<stop stop-color="#dfe3ea" offset="0"/>\n\
			<stop stop-color="#fff" offset="1"/>\n\
		</linearGradient>\n\
	</defs>\n\
	<symbol id="ic-up" viewBox="0 0 16 16">\n\
		<path stroke-linejoin="round" d="m7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z" stroke="#001138" stroke-width="0.4" fill="url(#folder-back-gradient)"/>\n\
	</symbol>\n\
	<symbol id="ic-folder" viewBox="0 0 16 16">\n\
		<g stroke-linejoin="round" stroke="#001138" stroke-width=".4">\n\
			<path d="M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z" opacity=".806" filter="url(#folder-shadow-blur)" fill="#000"/>\n\
			<path d="M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z" fill="url(#folder-back-gradient)"/>\n\
			<rect x="2.723" y="4.679" width="9.554" height="7.777" ry="0" fill="url(#folder-paper-gradient)"/>\n\
			<path d="M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z" fill="url(#folder-front-gradient)"/>\n\
		</g>\n\
	</symbol>\n\
	<symbol id="ic-file" viewBox="0 0 16 16">\n\
		<g stroke-linejoin="round" stroke-width="0.4">\n\
			<path d="m2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z" stroke="url(#linearGradient6557)" fill="url(#linearGradient6701)"/>\n\
			<path d="m10.5 0.5v3h3l-3-3z" stroke="url(#linearGradient6557)" fill="#fff"/>\n\
			<path d="m11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7" stroke="url(#linearGradient6557-93)" stroke-linecap="square" stroke-width=".5" fill="none"/>\n\
		</g>\n\
	</symbol>\n\
	<symbol id="ic-cross" viewBox="0 0 16 16">\n\
		<path stroke-linejoin="round" d="m5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z" stroke="url(#linearGradient6557)" stroke-width=".5" fill="url(#linearGradient6701)"/>\n\
	</symbol>\n\
	<symbol id="ic-volume" viewBox="0 0 16 16">\n\
		<g stroke-linejoin="round" stroke="url(#linearGradient6557)" fill="url(#linearGradient6701)" stroke-width=".4">\n\
			<path d="M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z"/>\n\
			<circle cx="8" cy="7" r="4.5"/>\n\
			<circle opacity=".652" cx="8" cy="7" r=".809" stroke-width=".8"/>\n\
			<path d="M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z"/>\n\
			<path d="M13.5.5v13M2.5.5v13" stroke-width=".2"/>\n\
		</g>\n\
		<path stroke-linejoin="round" d="M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z" stroke="url(#linearGradient6557)" stroke-width=".4" fill="url(#linearGradient6557)"/>\n\
		<path opacity=".5" d="M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z" fill="url(#linearGradient6557)"/>\n\
	</symbol>\n\
</svg>\n\
',
    js_storage = [ 'viewBox', '0 0 16 16',
	'defs', [
		'filter', [ 'id', 'folder-shadow-blur', 'width', '1.234', 'height', '1.255', 'x', '-.117', 'y', '-.128',
			'feGaussianBlur', [ 'stdDeviation', '.585' ] ],
		'linearGradient', [ 'id', 'folder-back-gradient', 'gradientUnits', 'userSpaceOnUse', 'x1', '11.5', 'y1', '11', 'x2', '11', 'y2', '4',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#b4d0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'folder-paper-gradient', 'gradientUnits', 'userSpaceOnUse', 'x1', '4.268', 'y1', '5.732', 'x2', '4.509', 'y2', '7.652',
			'stop', [ 'stop-color', '#fff', 'offset', '0' ],
			'stop', [ 'stop-color', '#dcdcdc', 'offset', '.584' ],
			'stop', [ 'stop-color', '#a9a9a9', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'folder-front-gradient', 'gradientUnits', 'userSpaceOnUse', 'x1', '10', 'y1', '4', 'x2', '6', 'y2', '18',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#87b4ff', 'offset', '.446' ],
			'stop', [ 'stop-color', '#fff', 'stop-opacity', '1', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'linearGradient6557', 'gradientUnits', 'userSpaceOnUse', 'x1', '11', 'y1', '18', 'y2', '-3',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#edf3ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'linearGradient6557-93', 'gradientUnits', 'userSpaceOnUse', 'x1', '14.5', 'y1', '12.5', 'x2', '-.5', 'y2', '4',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#e9f0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'linearGradient6701', 'gradientUnits', 'userSpaceOnUse', 'x1', '8', 'y1', '17', 'x2', '5', 'y2', '2',
			'stop', [ 'stop-color', '#dfe3ea', 'offset', '0' ],
			'stop', [ 'stop-color', '#fff', 'offset', '1' ] ] ],
	'symbol', [ 'id', 'ic-up', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 'stroke', '#001138', 'stroke-width', '0.4', 'fill', 'url(#folder-back-gradient)' ] ],
	'symbol', [ 'id', 'ic-folder', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', '#001138', 'stroke-width', '.4',
			'path', [ 'd', 'M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z', 'opacity', '.806', 'filter', 'url(#folder-shadow-blur)', 'fill', '#000' ],
			'path', [ 'd', 'M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z', 'fill', 'url(#folder-back-gradient)' ],
			'rect', [ 'x', '2.723', 'y', '4.679', 'width', '9.554', 'height', '7.777', 'ry', '0', 'fill', 'url(#folder-paper-gradient)' ],
			'path', [ 'd', 'M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z', 'fill', 'url(#folder-front-gradient)' ] ] ],
	'symbol', [ 'id', 'ic-file', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke-width', '0.4',
			'path', [ 'd', 'm2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z', 'stroke', 'url(#linearGradient6557)', 'fill', 'url(#linearGradient6701)' ],
			'path', [ 'd', 'm10.5 0.5v3h3l-3-3z', 'stroke', 'url(#linearGradient6557)', 'fill', '#fff' ],
			'path', [ 'd', 'm11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7', 'stroke', 'url(#linearGradient6557-93)', 'stroke-linecap', 'square', 'stroke-width', '.5', 'fill', 'none' ] ] ],
	'symbol', [ 'id', 'ic-cross', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z', 'stroke', 'url(#linearGradient6557)', 'stroke-width', '.5', 'fill', 'url(#linearGradient6701)' ] ],
	'symbol', [ 'id', 'ic-volume', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', 'url(#linearGradient6557)', 'fill', 'url(#linearGradient6701)', 'stroke-width', '.4',
			'path', [ 'd', 'M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z' ],
			'circle', [ 'cx', '8', 'cy', '7', 'r', '4.5' ],
			'circle', [ 'opacity', '.652', 'cx', '8', 'cy', '7', 'r', '.809', 'stroke-width', '.8' ],
			'path', [ 'd', 'M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z' ],
			'path', [ 'd', 'M13.5.5v13M2.5.5v13', 'stroke-width', '.2' ] ],
		'path', [ 'stroke-linejoin', 'round', 'd', 'M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z', 'stroke', 'url(#linearGradient6557)', 'stroke-width', '.4', 'fill', 'url(#linearGradient6557)' ],
		'path', [ 'opacity', '.5', 'd', 'M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z', 'fill', 'url(#linearGradient6557)' ] ] ],
    js_storage_oids = [ 'viewBox', '0 0 16 16',
	'defs', [
		'filter', [ 'id', '1', 'width', '1.234', 'height', '1.255', 'x', '-.117', 'y', '-.128',
			'feGaussianBlur', [ 'stdDeviation', '.585' ] ],
		'linearGradient', [ 'id', '2', 'gradientUnits', 'userSpaceOnUse', 'x1', '11.5', 'y1', '11', 'x2', '11', 'y2', '4',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#b4d0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', '3', 'gradientUnits', 'userSpaceOnUse', 'x1', '4.268', 'y1', '5.732', 'x2', '4.509', 'y2', '7.652',
			'stop', [ 'stop-color', '#fff', 'offset', '0' ],
			'stop', [ 'stop-color', '#dcdcdc', 'offset', '.584' ],
			'stop', [ 'stop-color', '#a9a9a9', 'offset', '1' ] ],
		'linearGradient', [ 'id', '4', 'gradientUnits', 'userSpaceOnUse', 'x1', '10', 'y1', '4', 'x2', '6', 'y2', '18',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#87b4ff', 'offset', '.446' ],
			'stop', [ 'stop-color', '#fff', 'stop-opacity', '1', 'offset', '1' ] ],
		'linearGradient', [ 'id', '5', 'gradientUnits', 'userSpaceOnUse', 'x1', '11', 'y1', '18', 'y2', '-3',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#edf3ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', '6', 'gradientUnits', 'userSpaceOnUse', 'x1', '14.5', 'y1', '12.5', 'x2', '-.5', 'y2', '4',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#e9f0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', '7', 'gradientUnits', 'userSpaceOnUse', 'x1', '8', 'y1', '17', 'x2', '5', 'y2', '2',
			'stop', [ 'stop-color', '#dfe3ea', 'offset', '0' ],
			'stop', [ 'stop-color', '#fff', 'offset', '1' ] ] ],
	'symbol', [ 'id', 'ic-up', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 'stroke', '#001138', 'stroke-width', '0.4', 'fill', 'url(#2)' ] ],
	'symbol', [ 'id', 'ic-folder', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', '#001138', 'stroke-width', '.4',
			'path', [ 'd', 'M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z', 'opacity', '.806', 'filter', 'url(#1)', 'fill', '#000' ],
			'path', [ 'd', 'M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z', 'fill', 'url(#2)' ],
			'rect', [ 'x', '2.723', 'y', '4.679', 'width', '9.554', 'height', '7.777', 'ry', '0', 'fill', 'url(#3)' ],
			'path', [ 'd', 'M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z', 'fill', 'url(#4)' ] ] ],
	'symbol', [ 'id', 'ic-file', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke-width', '0.4',
			'path', [ 'd', 'm2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z', 'stroke', 'url(#5)', 'fill', 'url(#7)' ],
			'path', [ 'd', 'm10.5 0.5v3h3l-3-3z', 'stroke', 'url(#5)', 'fill', '#fff' ],
			'path', [ 'd', 'm11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7', 'stroke', 'url(#6)', 'stroke-linecap', 'square', 'stroke-width', '.5', 'fill', 'none' ] ] ],
	'symbol', [ 'id', 'ic-cross', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z', 'stroke', 'url(#5)', 'stroke-width', '.5', 'fill', 'url(#7)' ] ],
	'symbol', [ 'id', 'ic-volume', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', 'url(#5)', 'fill', 'url(#7)', 'stroke-width', '.4',
			'path', [ 'd', 'M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z' ],
			'circle', [ 'cx', '8', 'cy', '7', 'r', '4.5' ],
			'circle', [ 'opacity', '.652', 'cx', '8', 'cy', '7', 'r', '.809', 'stroke-width', '.8' ],
			'path', [ 'd', 'M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z' ],
			'path', [ 'd', 'M13.5.5v13M2.5.5v13', 'stroke-width', '.2' ] ],
		'path', [ 'stroke-linejoin', 'round', 'd', 'M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z', 'stroke', 'url(#5)', 'stroke-width', '.4', 'fill', 'url(#5)' ],
		'path', [ 'opacity', '.5', 'd', 'M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z', 'fill', 'url(#5)' ] ] ],
    js_storage_oids2 = [ 'viewBox', '0 0 16 16',
	'defs', [
		'filter', [ 'id', 'a1', 'width', '1.234', 'height', '1.255', 'x', '-.117', 'y', '-.128',
			'feGaussianBlur', [ 'stdDeviation', '.585' ] ],
		'linearGradient', [ 'id', 'a2', 'gradientUnits', 'userSpaceOnUse', 'x1', '11.5', 'y1', '11', 'x2', '11', 'y2', '4',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#b4d0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'a3', 'gradientUnits', 'userSpaceOnUse', 'x1', '4.268', 'y1', '5.732', 'x2', '4.509', 'y2', '7.652',
			'stop', [ 'stop-color', '#fff', 'offset', '0' ],
			'stop', [ 'stop-color', '#dcdcdc', 'offset', '.584' ],
			'stop', [ 'stop-color', '#a9a9a9', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'a4', 'gradientUnits', 'userSpaceOnUse', 'x1', '10', 'y1', '4', 'x2', '6', 'y2', '18',
			'stop', [ 'stop-color', '#0062ff', 'offset', '0' ],
			'stop', [ 'stop-color', '#87b4ff', 'offset', '.446' ],
			'stop', [ 'stop-color', '#fff', 'stop-opacity', '1', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'a5', 'gradientUnits', 'userSpaceOnUse', 'x1', '11', 'y1', '18', 'y2', '-3',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#edf3ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'a6', 'gradientUnits', 'userSpaceOnUse', 'x1', '14.5', 'y1', '12.5', 'x2', '-.5', 'y2', '4',
			'stop', [ 'stop-color', '#001138', 'offset', '0' ],
			'stop', [ 'stop-color', '#e9f0ff', 'offset', '1' ] ],
		'linearGradient', [ 'id', 'a7', 'gradientUnits', 'userSpaceOnUse', 'x1', '8', 'y1', '17', 'x2', '5', 'y2', '2',
			'stop', [ 'stop-color', '#dfe3ea', 'offset', '0' ],
			'stop', [ 'stop-color', '#fff', 'offset', '1' ] ] ],
	'symbol', [ 'id', 'ic-up', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 'stroke', '#001138', 'stroke-width', '0.4', 'fill', 'url(#a2)' ] ],
	'symbol', [ 'id', 'ic-folder', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', '#001138', 'stroke-width', '.4',
			'path', [ 'd', 'M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z', 'opacity', '.806', 'filter', 'url(#a1)', 'fill', '#000' ],
			'path', [ 'd', 'M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z', 'fill', 'url(#a2)' ],
			'rect', [ 'x', '2.723', 'y', '4.679', 'width', '9.554', 'height', '7.777', 'ry', '0', 'fill', 'url(#a3)' ],
			'path', [ 'd', 'M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z', 'fill', 'url(#a4)' ] ] ],
	'symbol', [ 'id', 'ic-file', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke-width', '0.4',
			'path', [ 'd', 'm2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z', 'stroke', 'url(#a5)', 'fill', 'url(#a7)' ],
			'path', [ 'd', 'm10.5 0.5v3h3l-3-3z', 'stroke', 'url(#a5)', 'fill', '#fff' ],
			'path', [ 'd', 'm11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7', 'stroke', 'url(#a6)', 'stroke-linecap', 'square', 'stroke-width', '.5', 'fill', 'none' ] ] ],
	'symbol', [ 'id', 'ic-cross', 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z', 'stroke', 'url(#a5)', 'stroke-width', '.5', 'fill', 'url(#a7)' ] ],
	'symbol', [ 'id', 'ic-volume', 'viewBox', '0 0 16 16',
		'g', [ 'stroke-linejoin', 'round', 'stroke', 'url(#a5)', 'fill', 'url(#a7)', 'stroke-width', '.4',
			'path', [ 'd', 'M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z' ],
			'circle', [ 'cx', '8', 'cy', '7', 'r', '4.5' ],
			'circle', [ 'opacity', '.652', 'cx', '8', 'cy', '7', 'r', '.809', 'stroke-width', '.8' ],
			'path', [ 'd', 'M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z' ],
			'path', [ 'd', 'M13.5.5v13M2.5.5v13', 'stroke-width', '.2' ] ],
		'path', [ 'stroke-linejoin', 'round', 'd', 'M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z', 'stroke', 'url(#a5)', 'stroke-width', '.4', 'fill', 'url(#a5)' ],
		'path', [ 'opacity', '.5', 'd', 'M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z', 'fill', 'url(#a5)' ] ] ],
    js_storage_o = [ 'viewBox', '0 0 16 16',
	'defs', [
		'filters', [
			'1', [ 'box', '-.117 -.128 1.234 1.255',
				'feGaussianBlur', [ 'stdDeviation', '.585' ] ] ],
		'linearGradients', [ 'gradientUnits', 'userSpaceOnUse',
			'2', [ 'line', '11.5 11 11 4',
				'stops', [ '0', '#0062ff', '1', '#b4d0ff' ] ],
			'3', [ 'line', '4.268 5.732 4.509 7.652',
				'stops', [ '0', '#fff', '.584', '#dcdcdc', '1', '#a9a9a9' ] ],
			'4', [ 'line', '10 4 6 18',
				'stops', [ '0', '#0062ff', '.446', '#87b4ff', '1', '#fff,1' ] ],
			'5', [ 'line', '11 18 11 -3',
				'stops', [ '0', '#001138', '1', '#edf3ff' ] ],
			'6', [ 'line', '14.5 12.5 -.5 4',
				'stops', [ '0', '#001138', '1', '#e9f0ff' ] ],
			'7', [ 'line', '8 17 5 2',
				'stops', [ '0', '#dfe3ea', '1', '#fff' ] ] ] ],
	'symbols', [ 'viewBox', '0 0 16 16',
		'ic-up', [
			'path', [ 'stroke-linejoin', 'round', 'd', 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 'stroke', '#001138', 'stroke-width', '0.4', 'fill', 'url(#2)' ] ],
		'ic-folder', [
			'g', [ 'stroke-linejoin', 'round', 'stroke', '#001138', 'stroke-width', '.4',
				'path', [ 'd', 'M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z', 'opacity', '.806', 'filter', 'url(#1)', 'fill', '#000' ],
				'path', [ 'd', 'M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z', 'fill', 'url(#2)' ],
				'rect', [ 'x', '2.723', 'y', '4.679', 'width', '9.554', 'height', '7.777', 'ry', '0', 'fill', 'url(#3)' ],
				'path', [ 'd', 'M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z', 'fill', 'url(#4)' ] ] ],
		'ic-file', [
			'g', [ 'stroke-linejoin', 'round', 'stroke-width', '0.4',
				'path', [ 'd', 'm2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z', 'stroke', 'url(#5)', 'fill', 'url(#7)' ],
				'path', [ 'd', 'm10.5 0.5v3h3l-3-3z', 'stroke', 'url(#5)', 'fill', '#fff' ],
				'path', [ 'd', 'm11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7', 'stroke', 'url(#6)', 'stroke-linecap', 'square', 'stroke-width', '.5', 'fill', 'none' ] ] ],
		'ic-cross', [
			'path', [ 'stroke-linejoin', 'round', 'd', 'm5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z', 'stroke', 'url(#5)', 'stroke-width', '.5', 'fill', 'url(#7)' ] ],
		'ic-volume', [
			'g', [ 'stroke-linejoin', 'round', 'stroke', 'url(#5)', 'fill', 'url(#7)', 'stroke-width', '.4',
				'path', [ 'd', 'M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z' ],
				'circle', [ 'cx', '8', 'cy', '7', 'r', '4.5' ],
				'circle', [ 'opacity', '.652', 'cx', '8', 'cy', '7', 'r', '.809', 'stroke-width', '.8' ],
				'path', [ 'd', 'M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z' ],
				'path', [ 'd', 'M13.5.5v13M2.5.5v13', 'stroke-width', '.2' ] ],
			'path', [ 'stroke-linejoin', 'round', 'd', 'M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z', 'stroke', 'url(#5)', 'stroke-width', '.4', 'fill', 'url(#5)' ],
			'path', [ 'opacity', '.5', 'd', 'M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z', 'fill', 'url(#5)' ] ] ] ],
    js_storage_p = [ '[voc]', 'd\tpath\tfill\tstroke-width\tstroke\t1\t0\turl(#5)\tstops\tstroke-linejoin\tround\tline\t#001138\t#fff\t.5\tg\t.4\topacity\t7\turl(#7)\turl(#2)\tviewBox\t0.4\t8\t#0062ff\t0 0 16 16\tcircle\tcx\tcy\tr', 21, 25,
	'defs', [
		'filters', [
			5, [ 'box', '-.117 -.128 1.234 1.255',
				'feGaussianBlur', [ 'stdDeviation', '.585' ] ] ],
		'linearGradients', [ 'gradientUnits', 'userSpaceOnUse',
			'2', [ 11, '11.5 11 11 4',
				8, [ 6, 24, 5, '#b4d0ff' ] ],
			'3', [ 11, '4.268 5.732 4.509 7.652',
				8, [ 6, 13, '.584', '#dcdcdc', 5, '#a9a9a9' ] ],
			'4', [ 11, '10 4 6 18',
				8, [ 6, 24, '.446', '#87b4ff', 5, '#fff,1' ] ],
			'5', [ 11, '11 18 11 -3',
				8, [ 6, 12, 5, '#edf3ff' ] ],
			'6', [ 11, '14.5 12.5 -.5 4',
				8, [ 6, 12, 5, '#e9f0ff' ] ],
			18, [ 11, '8 17 5 2',
				8, [ 6, '#dfe3ea', 5, 13 ] ] ] ],
	'symbols', [ 21, 25,
		'ic-up', [
			1, [ 9, 10, 0, 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 4, 12, 3, 22, 2, 20 ] ],
		'ic-folder', [
			15, [ 9, 10, 4, 12, 3, 16,
				1, [ 0, 'M1.76 4.07l1-1h4l1 1h5l1 1v9h-12v-10z', 17, '.806', 'filter', 'url(#1)', 2, '#000' ],
				1, [ 0, 'M1.5 3.5l1-1h4l1 1h5l1 1v9h-12v-10z', 2, 20 ],
				'rect', [ 'x', '2.723', 'y', '4.679', 'width', '9.554', 'height', '7.777', 'ry', 6, 2, 'url(#3)' ],
				1, [ 0, 'M1.5 13.5c.688-2.333.34-3.667 2-6l12-1c-1.66 2.604-1.54 4.723-2 7h-12z', 2, 'url(#4)' ] ] ],
		'ic-file', [
			15, [ 9, 10, 3, 22,
				1, [ 0, 'm2.5 1 0.5-0.5h7.5l3 3v11.5l-0.5 0.5h-10l-0.5-0.5v-14z', 4, 7, 2, 19 ],
				1, [ 0, 'm10.5 0.5v3h3l-3-3z', 4, 7, 2, 13 ],
				1, [ 0, 'm11.5 13.5h-7m7-2h-7m7-2h-7m7-2h-7m7-2h-7', 4, 'url(#6)', 'stroke-linecap', 'square', 3, 14, 2, 'none' ] ] ],
		'ic-cross', [
			1, [ 9, 10, 0, 'm5 3-2 2 3 3-3 3 2 2 3-3 3 3 2-2l-3-3 3-3-2-2-3 3-3-3z', 4, 7, 3, 14, 2, 19 ] ],
		'ic-volume', [
			15, [ 9, 10, 4, 7, 2, 19, 3, 16,
				1, [ 0, 'M2 1l.5-.5h11l.5.5v14l-.5.5h-11L2 15z' ],
				26, [ 27, 23, 28, 18, 29, '4.5' ],
				26, [ 17, '.652', 27, 23, 28, 18, 29, '.809', 3, '.8' ],
				1, [ 0, 'M2 14l.5-.5h11l.5.5v1l-.5.5h-11L2 15z' ],
				1, [ 0, 'M13.5.5v13M2.5.5v13', 3, '.2' ] ],
			1, [ 9, 10, 0, 'M4.184 10.976c-.29.175-.382.55-.208.84.175.29.55.382.84.208.026-.016.045-.036.058-.045l3.474-2.81-4.092 1.777c-.015.006-.044.013-.072.03z', 4, 7, 3, 16, 2, 7 ],
			1, [ 17, 14, 0, 'M9 14.5l.5-.5H12l.5.5-.5.5H9.5l-.5-.5z', 2, 7 ] ] ] ];


var js_spec = [
	'attr', ''
],
    js_spec_p = [
	'attr', ''
],
    js_spec_oids = [ 'viewBox', '0 0 16 16',
	'defs', [
		'filter', [ 'width', '1.234', 'height', '1.255', 'x', '-.117', 'y', '-.128',
			'feGaussianBlur', [ 'stdDeviation', '.585' ] ],
		'radialGradient', [ 'id', 'ok', 'cx', '50%', 'cy', '50%', 'r', '50%',
			'stop', [ 'stop-color', '#000', 'offset', '0' ],
			'stop', [ 'stop-color', '#fff', 'offset', '1', '', 'te' ] ],
		'radialGradient', [ 'id', 'go', 'cx', '50%', 'cy', '50%', 'r', '50%', 'fx', '25%', 'fy', '75%' ],
		'linearGradient', [ 'id', 'uf', 'gradientUnits', 'userSpaceOnUse', 'x1', '11.5', 'y1', '11', 'x2', '11' ],
		'linearGradient', [ 'gradientUnits', 'userSpaceOnUse', 'x1', '11.5', 'y1', '11', 'x2', '11',
			'stop', [ 'offset', '0' ],
			'stop', [ 'stop-color', '#b4d0ff', 'offset', '1' ] ] ],
	'symbol', [ 'viewBox', '0 0 16 16',
		'path', [ 'stroke-linejoin', 'round', 'd', 'm7.5 2-5 5.5 3.5-1v7h6.5l1.5-2.5h-5v-4.5l3.5 1z', 'stroke', '#001138', 'stroke-width', '0.4', 'fill', 'url(#2)' ] ] ],
    js_spec_o = [ 'viewBox', '0 0 16 16',
	'defs', [
		'linearGradients', [ 'gradientUnits', 'userSpaceOnUse',
			'uf', [ 'line', '11.5 11 11 11' ] ],
		'radialGradients', [
			'ok', [ 'rad', '50% 50% 50%  ',
				'stops', [ '0', '#000', '1', '#fff' ] ],
			'go', [ 'rad', '50% 50% 50% 25% 75%' ] ] ] ];


function massive(name, fn, pairs) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 3)
			(function (name, args, ret) {
				test(name, function (done) {
					(args instanceof Array ? fn.apply(null, args) : fn.call(null, args)).then(function (result) {
						try {
							assert.deepStrictEqual(ret, result);
							done();
						} catch (e) {
							console.error(jso.jsml2str(result));
							return done(e);
						}
					}, done)
				});
			})(pairs[i], pairs[i+1], pairs[i+2]);
	});
}



suite('SVG to JS', function () {

	massive('parseSVG', function () {
		return jsvg.parseSVG.apply(jsvg, arguments).then(function (o) {
			//console.log(jso.jsml2str(o));
			return o;
		});
	} , [
		'arrows', svg_arrows, js_arrows,
		'storage', svg_storage, js_storage,
		'simple', '\
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 15 15">\n\
	<symbol viewBox="0 0 15 15" id="arrows-horizon">\n\
		<path d="M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z"/>\n\
	</symbol>\n\
	<g></g>\n\
	<t>text</t>\n\
</svg>\n', [ 'xmlns:xlink', 'http://www.w3.org/1999/xlink', 'viewBox', '0 0 15 15',
	'symbol', [ 'viewBox', '0 0 15 15', 'id', 'arrows-horizon',
		'path', [ 'd', 'M5.752 3.29c-.046.013-.097.04-.15.087v-.004L.16 7.168c-.213.182-.213.48 0 .662l5.442 3.793c.213.182.388.1.388-.18V9.857c0-.274.22-.495.492-.505L8.5 9.348c.28 0 .51.23.51.51v1.585c0 .28.175.362.388.18v.004l5.442-3.795c.213-.182.213-.48 0-.662L9.398 3.377c-.213-.182-.388-.1-.388.18v1.586c0 .274-.22.495-.492.505L6.5 5.652c-.28 0-.51-.23-.51-.51V3.558c0-.21-.1-.31-.238-.268z' ] ],
	'g', [ ],
	't', [ '', 'text' ],
	]
	]);

	massive('optimizeIds', function (o, pf) {
		var js = jsvg.optimizeIds(clone(o), pf);
		//console.log(jso.jsml2str(js));
		return Promise.resolve(js);
	} , [
		'arrows', [ js_arrows, '' ], js_arrows_oids,
		'storage', [ js_storage, '' ], js_storage_oids,
		'storage>a', [ js_storage, 'a' ], js_storage_oids2
	]);

	massive('optimizeJSVG', function (o) {
		var js = jsvg.optimizeJSVG(clone(o));
		//console.log(jso.jsml2str(js));
		return Promise.resolve(js);
	} , [
		'arrows', [ js_arrows_oids ], js_arrows_o,
		'storage', [ js_storage_oids ], js_storage_o,
		'spec', [ js_spec_oids ], js_spec_o
	]);

	massive('packJSVG', function (o) {
		var js = jsvg.packJSVG(clone(o));
		//console.log(jso.jsml2str(js));
		return Promise.resolve(js);
	} , [
		'arrows', [ js_arrows_o ], js_arrows_p,
		'storage', [ js_storage_o ], js_storage_p,
		'spec', [ js_spec ], js_spec_p
	]);

});
