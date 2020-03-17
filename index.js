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
		return new Promise((resolve, reject) => {
			fs.promises.readFile(`${__dirname}/data/${filePath}`, 'utf8').then(result => resolve(JSON.parse(result)));
		});
	} else {
		return fs.promises.readFile(`${__dirname}/data/${filePath}`, 'utf8');
	}
}

function generateDataCode(outputPath) {
	return new Promise((resolve, reject) => {
		template.getFolderAsData(path.join(__dirname, 'data'))
			.then(items => Promise.all(items.map(filePath => readData(filePath)))
				.then(contents => {
					const root = {};
					items.forEach((path, index) => {
						assignData(root, path, contents[index]);
					});

					const code = `function getData() {
						\n${indented(`// global game data\nreturn ${stringify(root, null, 3)};`, "  ")}
					\n}`;

					fs.mkdir(path.dirname(outputPath), { recursive: true }, err => {
						if (err) throw err;
						fs.writeFile(outputPath, code, err => {
							if (err) throw err;
						});
					});
					resolve(code);
				}
			)
		);
	});
}

function clearGenerated() {
    const publicDir = `${webDir}/generated`;
    const generatedDir = 'data/generated';
    return assets.deleteFolders(publicDir, generatedDir);
}

function copyScenes() {
	return new Promise((resolve, reject) =>
		fs.promises.mkdir(path.join(__dirname, `${webDir}/generated/js/scenes`), { recursive: true })
			.then(() => {
				template.getFolderAsData(path.join(__dirname, 'game', 'scenes')).then(scenes => {
					Promise.all(scenes.filter(file => path.extname(file)===".js").map(scene => {
						//check if folder needs to be created
					    const targetFolder = path.join(__dirname, webDir, 'generated', 'js', 'scenes', path.dirname(scene));
					    if ( !fs.existsSync( targetFolder ) ) {
					        fs.mkdirSync( targetFolder );
					    }

						fs.promises.copyFile(
							path.join(__dirname, 'game', 'scenes', scene),
							path.join(__dirname, webDir, 'generated', 'js', 'scenes', scene)
						);
					})).then(resolve);
				});
			}
		)
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

app.get('/', function (req, res) {
	clearGenerated().then(() => {
		copyScenes().then(() => {
			template.getFolderAsData(path.join(__dirname, 'game', 'scenes')).then(items => {
				const scenes = items.filter(file => path.basename(file)==="start.js").map(file => path.dirname(file));
				template.renderTemplateFromFile('index', path.join(__dirname, 'game', 'config.json'), { scenes: scenes.map(fileName => path.parse(fileName).name) })
					.then(html => assets.produceSpritesheets(`${__dirname}/game/scenes/`, TEXTURE_SIZE, TEXTURE_SIZE)
						.then(() => generateDataCode(path.join(webDir, 'generated', 'js', 'data.js'))
							.then(() => {
								res.send(html);
								fs.writeFile(`${webDir}/index.html`, html, err => {
									if (err) throw err;
									zipGame();
								});
							})
						)
					);
			});
		});
	});
});

app.get('/spritesheet', function(req, res) {
	assets.produceSpritesheets(`${__dirname}/game/scenes`, TEXTURE_SIZE, TEXTURE_SIZE).then(({spritesheets, data}) => {
		generateDataCode(path.join(webDir, 'generated', 'js', 'data.js')).then(code => {
			res.writeHeader(200, {"Content-Type": "text/html"}); 
			data.spritesheets.forEach(src => {
		        res.write(`<a href="${src}"><img style='background-color: #ddddee; border: 1px solid black' src="${src}" width=200></a>`);  
			});
			res.write(`<pre>${code}</pre>`);
			res.end();
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
	generateDataCode(path.join(webDir, 'generated', 'data', 'data.js'))
		.then(code => {
			res.writeHeader(200, {"Content-Type": "javascript:application"}); 
			res.write(code);
			res.end();			
		});
});

app.use(express.static(`${__dirname}/${webDir}`));

app.listen(port, () => console.log(`Listening on port ${port}!`));