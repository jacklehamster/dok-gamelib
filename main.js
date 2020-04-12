/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


const stringify = require("json-stringify-pretty-compact");
const { highlight } = require("highlight.js");
const beautify = require('js-beautify');
const isVarName = require('is-var-name');

window.Tools = {
	stringify,
	highlight,
	beautify,
	isVarName,
};
