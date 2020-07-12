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
const { webDir, sourceFolders, editorFolders, releaseFolders, package } = require('./common');
const {
	getSpritesheets,
	copyVideos,
	copySounds,
	copySource,
	minifyEngine,
	generateDataCode,
	zipGame,
	preProcess,
} = require('./lib/main');

const app = express();
const port = 8000;

function build(webDir, dirname) {
	console.log("Web directory:", webDir);
	console.log(`Build game: ${new Date()}`);
	const startTime = Date.now();
	const release = true;
	return preProcess(dirname, release)
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
	.then(() => {
		const { name, version } = package;
		fs.writeFile(`${webDir}/version`, `${name} ${version}`, function (err) {
		  if (err) return console.log(err);
		  Promise.resolve();
		});
	})
	.then(() => zipGame(webDir, dirname))
	.then(ziplocation => {
		fs.mkdirSync(`${webDir}/archive`, { recursive: true });
		return fs.promises.copyFile(ziplocation, `${webDir}/archive/game.zip`);
	})
	.then(() => console.log(`Done game building: ${Date.now() - startTime}ms`));
}
build(webDir, __dirname);

