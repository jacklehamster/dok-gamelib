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
const cors = require('cors');
const assets = require('./lib/assets');
const zip = require('./lib/zip');
const template = require('./lib/template');
const socket = require('./lib/socket');
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
	saveFontMap,
} = require('./lib/main');

const app = express();

const port = process.env.PORT || 8000;
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


const TEXTURE_SIZE = 4096;

//ENABLE CORS
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/', function (req, res) {
	const release = req.query.release && req.query.release !== 'false';
	console.log(`Processing game: ${new Date()}`);
	const startTime = Date.now();
	getSpritesheets(webDir, __dirname)
	.then(() => Promise.all([
		copyVideos(webDir, __dirname),
		copySounds(webDir, __dirname),
		copySource(webDir, __dirname),
		release ? minifyEngine(sourceFolders, editorFolders) : assets.deleteFolders(`docs/generated/js/engine`, `docs/generated/js/editor`),
		fs.promises.copyFile(`${__dirname}/src/game/game.json`, `${__dirname}/data/generated/game.json`),
	]))
	.then(() => console.log(`Done processing assets: ${Date.now() - startTime}ms`))
	.then(() => Promise.all([
		template.getFolderAsData(path.join(__dirname, 'src/game/scenes')),
		template.getFolderAsData(path.join(__dirname, 'docs/generated/js/source')),
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
		return template.renderTemplateFromFile('index', path.join(__dirname, 'src/game/game.json'), {
			scenes: scenes.map(fileName => path.parse(fileName).name),
			source,
			editor,
			release,
		});
	})
	.then(html => generateDataCode(path.join(webDir, 'generated/js/data.js'), __dirname).then(() => html))
	.then(html => {
		res.send(html);
		return release ? fs.promises.writeFile(`${webDir}/index.html`, html).then(() => {
			zipGame(webDir, __dirname);
			return html;
		}) : Promise.resolve();
	})
	.then(() => {
		console.log(`Done game processing: ${Date.now() - startTime}ms`);
		console.log(`Game rendered on localhost:${port}`.green);
	});
});

app.get('/videos', function(req, res) {
	copyVideos().then(data => {
		res.send(data);
	});
});

app.get('/spritesheet', function(req, res) {
	saveFontMap(__dirname).then(() => {
		getSpritesheets(webDir, __dirname).then(({spritesheets}) => {
			generateDataCode(path.join(webDir, 'generated', 'js', 'data.js'), __dirname).then(code => {
				res.writeHeader(200, {"Content-Type": "text/html"}); 
				spritesheets.forEach(({url}) => {
			        res.write(`<a href="${url}"><img style='background-color: #ddddee; border: 1px solid black' src="${url}" width=200></a>`);  
				});
				res.write(`<pre>${code}</pre>`);
				res.end();
			});				
		});
	});
});

app.get('/zip', function(req, res) {
	const publicDirectory = `${__dirname}/${webDir}/`;
	zip.zipDirectory(publicDirectory, `${__dirname}/build/archive.zip`);
	res.writeHeader(200, {"Content-Type": "text/html"}); 
	res.write('ok');
	res.end();
});

app.get('/get-from-files', function(req, res) {
	const paths = req.query.files.split(',');
	template.getFromFiles(paths).then(contents => {
		res.writeHeader(200, {"Content-Type": "text/html"}); 
		res.write(JSON.stringify(contents));
		res.end();
	});
});

app.get('/data', (req, res) => {
	generateDataCode(path.join(webDir, 'generated', 'js', 'data.js'), __dirname)
		.then(code => {
			res.writeHeader(200, {"Content-Type": "javascript:application"}); 
			res.write(code);
			res.end();			
		});
});

app.get('/fonts', (req, res) => {
	saveFontMap(__dirname).then((fonts) => {
		for (let id in fonts) {
			return fs.promises.readFile(`${__dirname}/generated/assets/fonts/${id}.png`);
		}
		return Promise.reject("Font not found");
	}).then(data => {
		res.setHeader('Content-Type', 'image/png');
		res.end(data);
	}).catch(error => {
		res.status(500).send(error);
	});
});

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.use(cors());


const { io, server } = socket.serveSocket(app);

if (io !== null && server !== null) {
	app.get('/socket.info', (req, res) => {
		res.send("ok");
	});
}

app.use(express.static(`${__dirname}/${webDir}`));


const httpServer = server.listen(port, () => console.log(`Listening on port ${port}!`.bgGreen));
httpServer.timeout = 5 * 60 * 1000;

