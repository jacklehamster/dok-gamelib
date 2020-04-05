const express = require('express');
const path = require('path');
const fs = require('fs');
const assets = require('./lib/assets');
const zip = require('./lib/zip');
const template = require('./lib/template');
const stringify = require("json-stringify-pretty-compact");

const app = express();
const port = 8000;
const TEXTURE_SIZE = 4096;

const webDir = "docs";

function indented(string, indentation) {
	return string.split("\n").map(a => `${indentation}${a}`).join("\n");
}

function readData(filePath) {
	if (path.extname(filePath) === ".json") {
		return fs.promises.readFile(`${__dirname}/data/${filePath}`, 'utf8').then(result => Promise.resolve(JSON.parse(result)));
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

function clearGenerated() {
    const publicDir = `${webDir}/generated`;
    const generatedDir = 'data/generated';
    return assets.deleteFolders(publicDir, generatedDir);
}

function copyVideos() {
	return fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/videos`), { recursive: true }).then(() => {
	}).then(() => {
		return template.getFolderAsData(path.join(__dirname, 'game'));
	}).then(files => files.filter(filename => path.extname(filename).toLowerCase()===".mp4"))
	.then(videopaths => {
		return Promise.all(
			videopaths.map(videopath => {
				return fs.promises.copyFile(
					path.join(__dirname, 'game', videopath),
					path.join(__dirname, webDir, 'generated', 'videos', path.basename(videopath))
				);
			})
		).then(() => {
			const videos = {};
			videopaths.forEach(videopath => {
				const id = path.basename(videopath, ".mp4");
				videos[id] = {
					id,
					path: `generated/videos/${path.basename(videopath)}`,
				};
			});
			return videos;
		});		
	}).then(data => {
        const generatedDataDir = `${__dirname}/data/generated`;
		return fs.promises.mkdir(`${generatedDataDir}/config`, { recursive: true })
			.then(() => fs.promises.writeFile(`${generatedDataDir}/config/video.json`, JSON.stringify(data, null, '\t'))
		).then(() => data);
	});
}

function copyScenes() {
	return new Promise((resolve, reject) =>
		fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/js/scenes`), { recursive: true }).then(() => {
			template.getFolderAsData(path.join(__dirname, 'game', 'scenes')).then(scenes => {
				Promise.all(scenes.filter(file => path.extname(file)===".js").map(scene => {
					//check if folder needs to be created
				    const targetFolder = path.join(__dirname, webDir, 'generated', 'js', 'scenes', path.dirname(scene));
				    if ( !fs.existsSync( targetFolder ) ) {
				        fs.mkdirSync( targetFolder );
				    }

					return fs.promises.copyFile(
						path.join(__dirname, 'game', 'scenes', scene),
						path.join(__dirname, webDir, 'generated', 'js', 'scenes', scene)
					);
				}).concat([
					fs.promises.copyFile(`${__dirname}/game/game.json`, `${__dirname}/data/generated/config/game.json`),
				])).then(resolve);
			});
		})
	);
}

function copyLibs() {
	return new Promise((resolve, reject) =>
		fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/js/lib`), { recursive: true }).then(() => {
			template.getFolderAsData(path.join(__dirname, 'generated/lib')).then(libs => {
				Promise.all(libs.filter(file => path.extname(file)===".js").map(lib => {
					return fs.promises.copyFile(
						path.join(__dirname, 'generated/lib', lib),
						path.join(__dirname, webDir, 'generated', 'js', 'lib', lib)
					);
				})).then(resolve);
			});
		})
	);	
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
	const gamesDirectory = `${__dirname}/game/scenes`;
	const generatedAssetDir = `${__dirname}/generated`;
    const generatedDataDir = `${__dirname}/data/generated`;

	//	Check sha
	return Promise.all([
		assets.getAssetsSha(gamesDirectory, generatedAssetDir),
		new Promise((resolve, reject) => {
			if (!fs.existsSync(`${generatedDataDir}/config/sha.json`)) {
				resolve(null);
			} else {
				fs.promises.readFile(`${generatedDataDir}/config/sha.json`, 'utf8').then(result => resolve(JSON.parse(result)));
			}
		}),
	]).then(([newSha, savedSha]) => {
		const sameSha = JSON.stringify(newSha) === JSON.stringify(savedSha);
		if (sameSha) {
			return readData(`generated/config/imagedata.json`);
		} else {
		    const publicDir = `${webDir}/generated`;
		    const generatedDataDir = 'data/generated';
		    return assets.deleteFolders(publicDir, generatedDataDir).then(() => {
		    	return assets.produceSpritesheets([gamesDirectory, generatedAssetDir], TEXTURE_SIZE, TEXTURE_SIZE);
		    }).then(data => {
		    	return assets.getAssetsSha(gamesDirectory, generatedAssetDir);
		    }).then(data => {
				fs.promises.mkdir(`${generatedDataDir}/config`, { recursive: true })
					.then(() => fs.promises.writeFile(`${generatedDataDir}/config/sha.json`, JSON.stringify(data, null, '\t')));
				return data;
		    });
		}
	});
}

function saveFontMap() {
	return fs.promises.readFile(`${__dirname}/game/game.json`, 'utf8').then(result => {
		const { fonts } = JSON.parse(result);
		return fs.promises.mkdir(`generated/assets`, { recursive: true }).then(() => {
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
					return fs.promises.writeFile(`generated/assets/${id}.png`, buffer).then(() => {
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
					.then(() => fs.promises.copyFile(`generated/assets/fonts.json`, `${__dirname}/data/generated/config/fonts.json`))
					.then(() => fonts);
			});
		});
	});
}

app.get('/', function (req, res) {
	console.log(`Processing game: ${new Date()}`);
	const startTime = Date.now();
	saveFontMap().then(() => {
		return Promise.all([
			copyVideos(),
			getSpritesheets(),
			copyScenes(),
			copyLibs(),
		])
	})
	.then(() => console.log(`Done processing assets: ${Date.now() - startTime}ms`))
	.then(() => Promise.all([
		template.getFolderAsData(path.join(__dirname, 'game', 'scenes')),
		template.getFolderAsData(path.join(__dirname, 'docs/generated/js/lib')),
	]))
	.then(([sceneItems, libs]) => {
		const scenes = sceneItems.filter(file => path.basename(file)==="start.js").map(file => path.dirname(file));
		return template.renderTemplateFromFile('index', path.join(__dirname, 'game', 'game.json'), {
			scenes: scenes.map(fileName => path.parse(fileName).name),
			libs,
		});
	})
	.then(html => generateDataCode(path.join(webDir, 'generated', 'js', 'data.js')).then(() => html))
	.then(html => {
		res.send(html);
		return fs.promises.writeFile(`${webDir}/index.html`, html).then(() => {
			zipGame();
			return html;
		});
	})
	.then(() => {
		console.log(`Done game processing: ${Date.now() - startTime}ms`);
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
				spritesheets.forEach(src => {
			        res.write(`<a href="${src}"><img style='background-color: #ddddee; border: 1px solid black' src="${src}" width=200></a>`);  
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
			return fs.promises.readFile(`${__dirname}/generated/assets/${id}.png`);
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

app.listen(port, () => console.log(`Listening on port ${port}!`));