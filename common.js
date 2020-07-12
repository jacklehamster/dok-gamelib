/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */
 const package = require('./package.json');


const webDir = "docs";

const releaseFolders = [
	'release/release.js',
];

const sourceFolders = [
	'generated/lib/*.js',
	'src/engine/interfaces/*.js',
	'src/engine/lib/*.js',
	'src/engine/common/*.js',
	'src/engine/utils/*.js',
	'src/engine/sprites/base/base-sprite.js',
	'src/engine/sprites/image-sprite.js',
	'src/engine/sprites/animated-sprite.js',
	'src/engine/sprites/sprite.js',
	'src/engine/sprites/ui-sprite.js',
	'src/engine/core/*.js',
	'src/engine/communicator/*.js',
	'src/engine/socket/*.js',
	'src/engine/controls/*.js',
	'src/engine/ui/*.js',
	'src/engine/debug/*.js',
	'src/engine/worker/*.js',
	'src/engine/game/components/*.js',
	'src/engine/game/base/*.js',
	'src/engine/game/*.js',
	'src/engine/scene-manager/*.js',
];

const editorFolders = [
	'src/editor/**/*.js',
];


module.exports = {
	webDir,
	releaseFolders,
	sourceFolders,
	editorFolders,
	package,
};