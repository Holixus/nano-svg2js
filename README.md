[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

# nano-svg2js

[![Join the chat at https://gitter.im/Holixus/nano-svg2js](https://badges.gitter.im/Holixus/nano-svg2js.svg)](https://gitter.im/Holixus/nano-svg2js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

SVG to JS.

## API

### parseSVG(svg_text)

Return `Promise` object of parsed svg.

### optimizeIds(jsvg)

Returns modified(in place) jsvg tree with short ids except symbols identifiers.

### optimizeJSVG(jsvg)

Returns optimized in place jsvg tree.

### packJSVG(jsvg)

Returns packed JSVG tree.


[gitter-image]: https://badges.gitter.im/Holixus/nano-svg2js.svg
[gitter-url]: https://gitter.im/Holixus/nano-svg2js
[npm-image]: https://img.shields.io/npm/v/nano-svg2js.svg
[npm-url]: https://npmjs.org/package/nano-svg2js
[github-tag]: http://img.shields.io/github/tag/Holixus/nano-svg2js.svg
[github-url]: https://github.com/Holixus/nano-svg2js/tags
[travis-image]: https://travis-ci.org/Holixus/nano-svg2js.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-svg2js
[coveralls-image]: https://img.shields.io/coveralls/Holixus/nano-svg2js.svg
[coveralls-url]: https://coveralls.io/r/Holixus/nano-svg2js
[david-image]: http://img.shields.io/david/Holixus/nano-svg2js.svg
[david-url]: https://david-dm.org/Holixus/nano-svg2js
[license-image]: http://img.shields.io/npm/l/nano-svg2js.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/nano-svg2js.svg
[downloads-url]: https://npmjs.org/package/nano-svg2js
