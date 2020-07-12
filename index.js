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
const { serveSocket } = require('dok-socket');
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
	saveFontMap,
	getFiles,
	preProcess,
} = require('./lib/main');

const app = express();

const port = process.env.PORT || 8000;

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
	const dirname = __dirname;
	console.log("Web directory:", webDir);

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

app.get('/version', (req, res) => {
	res.end(`${package.name} ${package.version}`);
});

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.use(cors());


const { io, server } = serveSocket(app);

app.use(express.static(`${__dirname}/${webDir}`, {
	etag: true,
	lastModified: true,
	setHeaders: (res, path) => {
		if (path.endsWith('.html')) {
			// All of the project's HTML files end in .html
			res.setHeader('Cache-Control', 'no-cache');
		} else if (path.endsWith('.png')) {
			// If the RegExp matched, then we have a versioned URL.
			res.setHeader('Cache-Control', 'max-age=31536000');	//	1 year
		}
	},
}));


const httpServer = server.listen(port, () => console.log(`${package.name} ${package.version}\n`.green + `Listening on port ${port}!`.bgGreen));
httpServer.timeout = 5 * 60 * 1000;

