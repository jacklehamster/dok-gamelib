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

const app = express();
const port = 8000;
const TEXTURE_SIZE = 4096;

const webDir = "docs";

const sourceFolders = [
	'generated/lib/*.js',
	'src/engine/lib/*.js',
	'src/engine/common/*.js',
	'src/engine/utils/*.js',
	'src/engine/sprites/base-sprite.js',
	'src/engine/sprites/image-sprite.js',
	'src/engine/sprites/animated-sprite.js',
	'src/engine/sprites/sprite.js',
	'src/engine/sprites/ui-sprite.js',
	'src/engine/core/*.js',
	'src/engine/ui/*.js',
	'src/engine/game/components/*.js',
	'src/engine/game/*.js',
	'src/engine/scene-manager/*.js',
];

const editorFolders = [
	'src/editor/**/*.js',
];

function indented(string, indentation) {
	return string.split("\n").map(a => `${indentation}${a}`).join("\n");
}

function readData(filePath) {
	if (path.extname(filePath) === ".json") {
		return fs.promises.readFile(`${__dirname}/data/${filePath}`, 'utf8')
			.then(result => Promise.resolve(JSON.parse(result)));
	} else {
		return fs.promises.readFile(`${__dirname}/data/${filePath}`, 'utf8');
	}
}

function generateDataCode(outputPath) {
	return template.getFolderAsData(path.join(__dirname, 'data'))
		.then(items => Promise.all(items.map(filePath => readData(filePath)))
			.then(contents => {
				const root = {};
				items.forEach((path, index) => {
					assignData(root, path, contents[index]);
				});

				const code = `function getData() {
					\n${indented(`// global game data\nreturn ${stringify(root, null, 3)};`, "  ")}
				\n}`;

				return new Promise((resolve, reject) => {
					fs.mkdir(path.dirname(outputPath), { recursive: true }, err => {
						if (err) {
							reject(err);
						} else {
							fs.writeFile(outputPath, code, err => {
								if (err) {
									reject(err);
								} else {
									resolve(code);
								}
							});
						}
					});
				});
			}
		)
	);
}

function copySounds() {
	return fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/sounds`), { recursive: true }).then(() => {
	}).then(() => {
		return template.getFolderAsData(path.join(__dirname, 'src/game'));
	}).then(files => files.filter(filename => path.extname(filename).toLowerCase()===".mp3"))
	.then(videopaths => {
		return Promise.all(
			videopaths.map(musicPath => {
				return fs.promises.copyFile(
					path.join(__dirname, 'src/game', musicPath),
					path.join(__dirname, webDir, 'generated', 'sounds', path.basename(musicPath))
				);
			})
		).then(() => {
			const sounds = {};
			const regexScene = /(?<scene>[\w\d-]+)\/sounds\/[\w\d-@]+.[\w]+$/;
			videopaths.forEach(musicPath => {
				const match = musicPath ? musicPath.match(regexScene) : null;
				const scene = match && match.groups.scene !== "generated" ? match.groups.scene : null;

				const id = path.basename(musicPath, ".mp3");
				if (sounds[id]) {
					sounds[id].scenes.push(scene);
				}
				sounds[id] = {
					id,
					scenes: [scene],
					path: `generated/sounds/${path.basename(musicPath)}`,
				};
			});
			return sounds;
		});		
	}).then(data => {
        const generatedDataDir = `${__dirname}/data/generated`;
		return fs.promises.mkdir(`${generatedDataDir}`, { recursive: true })
			.then(() => fs.promises.writeFile(`${generatedDataDir}/sounds.json`, JSON.stringify(data, null, '\t'))
		).then(() => data);
	});
}

function copyVideos() {
	return fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/videos`), { recursive: true }).then(() => {
	}).then(() => {
		return template.getFolderAsData(path.join(__dirname, 'src/game'));
	}).then(files => files.filter(filename => path.extname(filename).toLowerCase()===".mp4"))
	.then(videopaths => {
		return Promise.all(
			videopaths.map(videopath => {
				return fs.promises.copyFile(
					path.join(__dirname, 'src/game', videopath),
					path.join(__dirname, webDir, 'generated', 'videos', path.basename(videopath))
				);
			})
		).then(() => {
			const videos = {};
			const regexScene = /(?<scene>[\w\d-]+)\/assets\/[\w\d-@]+.[\w]+$/;
			videopaths.forEach(videopath => {
				const match = videopath ? videopath.match(regexScene) : null;
				const scene = match && match.groups.scene !== "generated" ? match.groups.scene : null;

				const id = path.basename(videopath, ".mp4");
				if (videos[id]) {
					videos[id].scenes.push(scene);
				}
				videos[id] = {
					id,
					scenes: [scene],
					path: `generated/videos/${path.basename(videopath)}`,
				};
			});
			return videos;
		});		
	}).then(data => {
        const generatedDataDir = `${__dirname}/data/generated`;
		return fs.promises.mkdir(`${generatedDataDir}`, { recursive: true })
			.then(() => fs.promises.writeFile(`${generatedDataDir}/videos.json`, JSON.stringify(data, null, '\t'))
		).then(() => data);
	});
}

function copySource() {
	return template.getFolderAsData(path.join(__dirname, 'src'))
		.then(files => Promise.all(files.filter(file => path.extname(file)===".js")
			.map(file => fs.promises.mkdir(path.dirname(`${webDir}/generated/js/source/${file}`), { recursive: true})
				.then(() => fs.promises.copyFile(`src/${file}`, `${webDir}/generated/js/source/${file}`))
			)
		))
		.then(() => fs.promises.mkdir(`${webDir}/generated/js/source/lib`, { recursive: true}))
		.then(() => fs.promises.copyFile(`generated/lib/json-compact.js`, `${webDir}/generated/js/source/lib/json-compact.js`));
}

function minifyEngine() {
	console.log("Start minifying.");
	const startTime = Date.now();
	return Promise.all([
		fs.promises.mkdir(`docs/generated/js/engine`, { recursive: true }),
		fs.promises.mkdir(`docs/generated/js/editor`, { recursive: true }),
	])
	.then(Promise.all([
		minify({
			compressor: uglifyES,
			input: sourceFolders,
			output: 'docs/generated/js/engine/engine.min.js',
			options: {
				sourceMap: true,
			},
	  	}),
		minify({
			compressor: uglifyES,
			input: editorFolders,
			output: 'docs/generated/js/editor/editor.min.js',
			options: {
				sourceMap: true,
			},
	  	}),
	]))
	.then(() => {
		console.log("Done minifying. Time:", Date.now() - startTime);
	});
}

function assignData(root, path, value) {
	if (typeof path === "string") {
		path = path.split("/");
	}
	if (path.length === 1) {
		const idSplit = path[0].split(".");
		const camelId = idSplit[0]
			.split("-")
			.map((a,idx) => idx===0 ? a.toLowerCase() : a.charAt(0).toUpperCase() + a.substr(1).toLowerCase())
			.join("");
		root[camelId] = value;
	} else {
		if (!root[path[0]]) {
			root[path[0]] = {};
		}
		assignData(root[path[0]], path.slice(1), value);
	}
}

function zipGame() {
	fs.promises.mkdir(path.join(__dirname, 'build'), { recursive: true })
		.then(() => {
			const publicDirectory = `${__dirname}/${webDir}/`;
			zip.zipDirectory(publicDirectory, `${__dirname}/build/archive.zip`);
		}
	)	
}

function getSpritesheets() {
	const gamesDirectory = `${__dirname}/src/game/scenes`;
	const generatedAssetDir = `${__dirname}/generated/assets`;
    const generatedDataDir = `${__dirname}/data/generated`;

	//	Check sha
	return Promise.all([
		assets.getAssetsSha(gamesDirectory, generatedAssetDir),
		new Promise((resolve, reject) => {
			if (!fs.existsSync(`${generatedDataDir}/sha.json`)) {
				resolve(null);
			} else {
				fs.promises.readFile(`${generatedDataDir}/sha.json`, 'utf8')
					.then(result => resolve(JSON.parse(result)));
			}
		}),
	]).then(([newSha, savedSha]) => {
		const sameSha = JSON.stringify(newSha) === JSON.stringify(savedSha);
		if (sameSha && fs.existsSync(`${generatedDataDir}/imagedata.json`)) {
			return readData(`generated/imagedata.json`);
		} else {
		    const publicDir = `${webDir}/generated`;
		    const generatedDataDir = 'data/generated';
		    return assets.deleteFolders(publicDir, generatedDataDir)
		    .then(() => saveFontMap())
		    .then(() => assets.produceSpritesheets([gamesDirectory, generatedAssetDir], TEXTURE_SIZE, TEXTURE_SIZE))
		    .then(spritesheets => assets.getAssetsSha(gamesDirectory, generatedAssetDir).then(data => { return {data, spritesheets}; }))
		    .then(({data, spritesheets}) => {
				fs.promises.mkdir(`${generatedDataDir}`, { recursive: true })
					.then(() => fs.promises.writeFile(`${generatedDataDir}/sha.json`, JSON.stringify(data, null, '\t')));
				return Promise.resolve(spritesheets);
		    });
		}
	});
}

function saveFontMap() {
	return fs.promises.readFile(`${__dirname}/src/game/game.json`, 'utf8').then(result => {
		const { fonts } = JSON.parse(result);
		return fs.promises.mkdir(`generated/assets/fonts`, { recursive: true }).then(() => {
			if (!fs.existsSync(`generated/assets/fonts.json`)) {
				fs.writeFileSync(`generated/assets/fonts.json`, "{}");
			}
			return fs.promises.readFile(`generated/assets/fonts.json`, 'utf8')
		}).then(result => Promise.resolve(JSON.parse(result))).then(savedFonts => {
			const fontsArray = [];
			for (let id in fonts) {
				fontsArray.push({ ... fonts[id], id });
			}
			return Promise.all(fontsArray.filter(({id})=> id).map(font => {
				const { name, characters, fontSize, cellSize, letterInfo, id } = font;
				if (savedFonts && savedFonts[id] && name === savedFonts[id].name && characters === savedFonts[id].characters
					&& fontSize === savedFonts[id].fontSize && cellSize === savedFonts[id].cellSize) {
					return { ... savedFonts[id], id };
				} else {
					const { buffer, letterInfo } = assets.createFontSheet(font);
					return fs.promises.writeFile(`generated/assets/fonts/${id}.png`, buffer).then(() => {
						return {
							name, characters, fontSize, cellSize, letterInfo, id,
						};
					});
				}
			})).then((fontsArray) => {
				const fonts = {};
				fontsArray.forEach(({ name, characters, fontSize, cellSize, letterInfo, id }) => {
					fonts[id] = { name, characters, fontSize, cellSize, letterInfo };
				});
				return fs.promises.writeFile(`generated/assets/fonts.json`, JSON.stringify(fonts, null, '\t'))
					.then(() => fs.promises.mkdir(`${__dirname}/data/generated`, { recursive: true}))
					.then(() => fs.promises.copyFile(`generated/assets/fonts.json`, `${__dirname}/data/generated/fonts.json`))
					.then(() => fonts);
			});
		});
	});
}

app.get('/', function (req, res) {
	const release = req.query.release && req.query.release !== 'false';
	console.log(`Processing game: ${new Date()}`);
	const startTime = Date.now();
	getSpritesheets()
	.then(() => Promise.all([
		copyVideos(),
		copySounds(),
		copySource(),
		release ? minifyEngine() : assets.deleteFolders(`docs/generated/js/engine`, `docs/generated/js/editor`),
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
	.then(html => generateDataCode(path.join(webDir, 'generated/js/data.js')).then(() => html))
	.then(html => {
		res.send(html);
		return release ? fs.promises.writeFile(`${webDir}/index.html`, html).then(() => {
			zipGame();
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
	saveFontMap().then(() => {
		getSpritesheets().then(({spritesheets}) => {
			generateDataCode(path.join(webDir, 'generated', 'js', 'data.js')).then(code => {
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
	generateDataCode(path.join(webDir, 'generated', 'js', 'data.js'))
		.then(code => {
			res.writeHeader(200, {"Content-Type": "javascript:application"}); 
			res.write(code);
			res.end();			
		});
});

app.get('/fonts', (req, res) => {
	saveFontMap().then((fonts) => {
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

app.use(express.static(`${__dirname}/${webDir}`));

const server = app.listen(port, () => console.log(`Listening on port ${port}!`.bgGreen));
server.timeout = 5 * 60 * 1000;
