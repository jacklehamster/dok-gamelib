/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const assets = require('./lib/assets');
const zip = require('./lib/zip');
const template = require('./lib/template');
const stringify = require("json-stringify-pretty-compact");
const colors = require('colors');
const minify = require('@node-minify/core');
const uglifyES = require('@node-minify/uglify-es');
const {
	getSpritesheets,
	copyVideos,
	copySounds,
	copySource,
	minifyEngine,
	generateDataCode,
	zipGame,
} = require('./lib/main');

const app = express();
const port = 8000;

const webDir = "docs";

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

function build(webDir, dirname) {
	console.log(`Build game: ${new Date()}`);
	const startTime = Date.now();
	const release = true;
	return getSpritesheets(webDir, dirname)
		.then(() => Promise.all([
			copyVideos(webDir, dirname),
			copySounds(webDir, dirname),
			copySource(webDir, dirname),
			release ? minifyEngine(sourceFolders, editorFolders) : assets.deleteFolders(`docs/generated/js/engine`, `docs/generated/js/editor`),
			fs.promises.copyFile(`${dirname}/src/game/game.json`, `${dirname}/data/generated/game.json`),
		]))
		.then(() => console.log(`Done processing assets: ${Date.now() - startTime}ms`))
		.then(() => Promise.all([
			template.getFolderAsData(path.join(dirname, 'src/game/scenes')),
			template.getFolderAsData(path.join(dirname, 'docs/generated/js/source')),
		]))
		.then(([sceneItems, allSource]) => {
			//	filter out game scenes and editor scenes
			const source = allSource.filter(src => !src.startsWith("game/scenes") && !src.startsWith("editor/editor"));
			const editor = allSource.filter(src => src.startsWith("editor/editor"));
			//	sort source
			const trimmedSourceFolders = sourceFolders.map(src => src.split("*")[0]).map(src => src.split("/").slice(1).join("/"));
			function getIndex(file) {
				for (let i = 0; i < trimmedSourceFolders.length; i++) {
					if (file.startsWith(trimmedSourceFolders[i])) {
						return i;
					}
				}
				return -1;
			}
			source.sort((a, b) => getIndex(a) - getIndex(b));

			const scenes = sceneItems.filter(file => path.basename(file)==="start.js").map(file => path.dirname(file));
			return template.renderTemplateFromFile('index', path.join(dirname, 'src/game/game.json'), {
				scenes: scenes.map(fileName => path.parse(fileName).name),
				source,
				editor,
				release,
			});
		})
		.then(html => generateDataCode(path.join(webDir, 'generated/js/data.js'), dirname).then(() => html))
		.then(html => {
			return release ? fs.promises.writeFile(`${webDir}/index.html`, html).then(() => html) : Promise.resolve();
		})
		.then(() => zipGame(webDir, dirname))
		.then(ziplocation => {
			fs.mkdirSync(`${webDir}/archive`, { recursive: true });
			fs.promises.copyFile(ziplocation, `${webDir}/archive/game.zip`);
		})
		.then(() => console.log(`Done game building: ${Date.now() - startTime}ms`));
}
build(webDir, __dirname);

