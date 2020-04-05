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
