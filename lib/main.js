/**
  Dok-gamelib engine

  Description: Game engine for producing web games easily using JavaScript and WebGL
  Author: jacklehamster
  Sourcode: https://github.com/jacklehamster/dok-gamelib
  Year: 2020
 */

const assets = require('./assets');
const fs = require('fs');
const path = require('path');
const template = require('./template');
const minify = require('@node-minify/core');
const uglifyES = require('@node-minify/uglify-es');
const stringify = require("json-stringify-pretty-compact");
const zip = require('./zip');
const glob = require('glob');
const { webDir, sourceFolders, editorFolders, releaseFolders } = require('../common');

const TEXTURE_SIZE = 4096;

function indented(string, indentation) {
	return string.split("\n").map(a => `${indentation}${a}`).join("\n");
}

function readData(filePath, dirname) {
	if (path.extname(filePath) === ".json") {
		return fs.promises.readFile(`${dirname}/data/${filePath}`, 'utf8')
			.then(result => Promise.resolve(JSON.parse(result)));
	} else {
		return fs.promises.readFile(`${dirname}/data/${filePath}`, 'utf8');
	}
}

function generateDataCode(outputPath, dirname) {
	return template.getFolderAsData(path.join(dirname, 'data'))
		.then(items => Promise.all(items.map(filePath => readData(filePath, dirname)))
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

function copySounds(webDir, dirname) {
	return fs.promises.mkdir(path.join(dirname, `${webDir}/generated/sounds`), { recursive: true }).then(() => {
	}).then(() => {
		return template.getFolderAsData(path.join(dirname, 'src/game'));
	}).then(files => files.filter(filename => path.extname(filename).toLowerCase()===".mp3"))
	.then(videopaths => {
		return Promise.all(
			videopaths.map(musicPath => {
				return fs.promises.copyFile(
					path.join(dirname, 'src/game', musicPath),
					path.join(dirname, webDir, 'generated', 'sounds', path.basename(musicPath))
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
        const generatedDataDir = `${dirname}/data/generated`;
		return fs.promises.mkdir(`${generatedDataDir}`, { recursive: true })
			.then(() => fs.promises.writeFile(`${generatedDataDir}/sounds.json`, JSON.stringify(data, null, '\t'))
		).then(() => data);
	});
}

function copyVideos(webDir, dirname) {
	return fs.promises.mkdir(path.join(dirname, `${webDir}/generated/videos`), { recursive: true }).then(() => {
	}).then(() => {
		return template.getFolderAsData(path.join(dirname, 'src/game'));
	}).then(files => files.filter(filename => path.extname(filename).toLowerCase()===".mp4"))
	.then(videopaths => {
		return Promise.all(
			videopaths.map(videopath => {
				return fs.promises.copyFile(
					path.join(dirname, 'src/game', videopath),
					path.join(dirname, webDir, 'generated', 'videos', path.basename(videopath))
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
        const generatedDataDir = `${dirname}/data/generated`;
		return fs.promises.mkdir(`${generatedDataDir}`, { recursive: true })
			.then(() => fs.promises.writeFile(`${generatedDataDir}/videos.json`, JSON.stringify(data, null, '\t'))
		).then(() => data);
	});
}

function copy(from, to) {
	fs.mkdirSync(path.dirname(to), { recursive: true });
	return fs.promises.copyFile(from, to);
}

function copySource(webDir, dirname) {
	const fullWebDir = `${dirname}/${webDir}`
	const files = getFiles(...sourceFolders).concat(getFiles(...editorFolders));

	const jsonCompactFilename = `${fullWebDir}/generated/js/source/lib/json-compact.js`;
	const workerFile = `${fullWebDir}/generated/js/source/worker/worker.js`;

	return copy(`${dirname}/generated/lib/json-compact.js`, jsonCompactFilename)
		.then(copy(`${dirname}/src/worker/worker.js`, workerFile))
		.then(Promise.all(files.filter(file => file.startsWith("src/")).map(file => file.split("src/")[1]).map(file => {
			return copy(`${dirname}/src/${file}`, `${fullWebDir}/generated/js/source/${file}`)
				.then(() => `${fullWebDir}/generated/js/source/${file}`)
		})))
		.then(() => {
			return files.map(file => path.relative(`src/`, file));
		})
		.then(files => files.filter(file => !file.startsWith("../")).concat(`lib/json-compact.js`))
		.then(files => {
			const gameFolder = `${dirname}/src/game`;
			return template.getFolderAsData(gameFolder)
				.then(gameSources => Promise.all(gameSources.filter(file => path.extname(file) === ".js").map(file => {
					const fullPath = `${gameFolder}/${file}`;
					const fullTargetPath = `${fullWebDir}/generated/js/source/game/${file}`;
					return copy(fullPath, fullTargetPath).then(() => `game/${file}`);
				})))
				.then(gameSources => files.concat(gameSources));
		})
		.then(files => {
			const groups = {};
			files.forEach(file => {
				const split = file.split(path.sep);
				const groupName = split[0];
				const group = groups[groupName] || (groups[groupName] = []);
				group.push(split.slice(1).join(path.sep));
			});
			return groups;
		});
}

function getFilesizeInKiloBytes(...filenames) {
	let size = 0;
	filenames.forEach(filename => {
	    const stats = fs.statSync(filename);
	    size += stats.size;
	});
    return size / 1000;
}

function getFiles(...patterns) {
	const files = [];
	patterns.forEach(pattern => {
		files.push(... glob.sync(pattern));
	});
	return files;
}

function minifyEngine(webDir, releaseFolders, sourceFolders, editorFolders) {
	console.log("Start minifying.");
	const startTime = Date.now();
	const engineMiniFile = `${webDir}/generated/js/engine/engine.min.js`;
	const editorMiniFile = `${webDir}/generated/js/editor/editor.min.js`;

	console.log({sourceFolders});
	console.log({editorFolders});

	fs.mkdirSync(path.dirname(engineMiniFile), { recursive: true });
	fs.mkdirSync(path.dirname(editorMiniFile), { recursive: true });

	return Promise.all([
		minify({
			compressor: uglifyES,
			input: releaseFolders.concat(sourceFolders),
			output: engineMiniFile,
			options: {
				sourceMap: true,
			},
	  	}),
		minify({
			compressor: uglifyES,
			input: editorFolders,
			output: editorMiniFile,
			options: {
				sourceMap: true,
			},
	  	}),
	])
	.then(() => {
		console.log(infoFolders(sourceFolders, engineMiniFile));
		console.log(infoFolders(editorFolders, editorMiniFile));
		console.log("Done minifying. Time:", Date.now() - startTime);
		const miniSource = `${webDir}/generated/js`;
		return [ path.relative(miniSource, engineMiniFile), path.relative(miniSource, editorMiniFile)];
	});
}

function infoFolders(sources, minFile) {
	const sourcesSize = getFilesizeInKiloBytes(...getFiles(...sources));
	const minSize = getFilesizeInKiloBytes(minFile);
	return `Source folders (${sourcesSize}kb) => ${minFile} (${minSize}kb): ${(100 * minSize / sourcesSize).toFixed(3)}%`;
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

function zipGame(webDir, dirname) {
	return fs.promises.mkdir(path.join(dirname, 'build'), { recursive: true })
		.then(() => {
			const publicDirectory = `${dirname}/${webDir}/`;
			const ziplocation = `${dirname}/build/archive.zip`;
			zip.zipDirectory(publicDirectory, ziplocation);
			return ziplocation;
		}
	)	
}

function getSpritesheets(webDir, dirname) {
	const gamesDirectory = `${dirname}/src/game/scenes`;
	const generatedAssetDir = `${dirname}/generated/assets`;
    const generatedDataDir = `${dirname}/data/generated`;

	//	Check sha
	return Promise.all([
		assets.getAssetsSha(gamesDirectory, generatedAssetDir),
		new Promise((resolve, reject) => {
			if (!fs.existsSync(`${generatedDataDir}/sha.json`) || !fs.existsSync(`${webDir}/generated/spritesheets`)) {
				resolve(null);
			} else {
				fs.promises.readFile(`${generatedDataDir}/sha.json`, 'utf8')
					.then(result => resolve(JSON.parse(result)));
			}
		}),
	]).then(([newSha, savedSha]) => {
		const sameSha = JSON.stringify(newSha) === JSON.stringify(savedSha);
		if (sameSha && fs.existsSync(`${generatedDataDir}/imagedata.json`)) {
			return readData(`generated/imagedata.json`, dirname);
		} else {
		    const publicDir = `${webDir}/generated`;
		    const generatedDataDir = 'data/generated';
		    return assets.deleteFolders(publicDir, generatedDataDir)
		    .then(() => saveFontMap(dirname))
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

function saveFontMap(dirname) {
	return fs.promises.readFile(`${dirname}/src/game/game.json`, 'utf8').then(result => {
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
					.then(() => fs.promises.mkdir(`${dirname}/data/generated`, { recursive: true}))
					.then(() => fs.promises.copyFile(`${dirname}/generated/assets/fonts.json`, `${dirname}/data/generated/fonts.json`))
					.then(() => fonts);
			});
		});
	});
}

function preProcess(dirname, release) {
	const startTime = Date.now();
	return getSpritesheets(webDir, dirname)
	.then(() => Promise.all([
		copyVideos(webDir, dirname),
		copySounds(webDir, dirname),
		copySource(webDir, dirname),
		release ? minifyEngine(webDir, releaseFolders, sourceFolders, editorFolders) : assets.deleteFolders(`${webDir}/generated/js/engine`, `${webDir}/generated/js/editor`).then(() => []),
		fs.promises.copyFile(`${dirname}/src/game/game.json`, `${dirname}/data/generated/game.json`).then(() => `${__dirname}/data/generated/game.json`),
	]))
	.then(([videos, sounds, groups, [engine, editor], json]) => {
		const sources = {...groups, mini: {engine, editor}};
		return fs.promises.mkdir(`${webDir}/generated/js`, { recursive: true })
			.then(() => fs.promises.writeFile(`${webDir}/generated/js/sources.js`, `const sources = ${JSON.stringify(sources, null, '\t')}`));
	})
	.then(() => Promise.all([
		template.getFolderAsData(path.join(dirname, 'src/game/scenes')),
		template.getFolderAsData(path.join(dirname, `${webDir}/generated/js/source`)),
	]))
	.then((sources) => {
		console.log(`Done processing assets: ${Date.now() - startTime}ms`);
		return sources;
	});
}


module.exports = {
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
};