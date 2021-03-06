/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


const fs = require('fs');
const path = require('path');
const imageSize = require('image-size');
const { createCanvas, loadImage, registerFont, Image } = require('canvas');
const crypto = require('crypto');
const rimraf = require("rimraf");
const sha256File = require('sha256-file');
const template = require('./template');
const { createSDF } = require('./sdf.js');
const compress_images = require('compress-images');
const imagemin = require('imagemin');
const imageminOptipng = require('imagemin-optipng');
const imageminPngquant = require('imagemin-pngquant');
const trimImage = require('trim-image');


function showError(error, filename, req, res) {
    if(error.code == 'ENOENT'){
        fs.readFile('./404.html', function(error, content) {
			const extname = path.extname(filename);
		    let contentType = 'text/html';
		    switch (extname) {
		        case '.js':
		            contentType = 'text/javascript';
		            break;
		        case '.css':
		            contentType = 'text/css';
		            break;
		        case '.json':
		            contentType = 'application/json';
		            break;
		        case '.png':
		            contentType = 'image/png';
		            break;      
		        case '.jpg':
		            contentType = 'image/jpg';
		            break;
		        case '.wav':
		            contentType = 'audio/wav';
		            break;
		    }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    }
    else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
        res.end(); 
    }
}

function loadImages(images) {
	return Promise.all(images.map(src => loadImage(src)));
}

function loadImagesFromPath(dirs) {
	return Promise.all(dirs.map(dir => {
		if (dir.charAt(dir.length-1) !== "/") {
			dir += "/";
		}
		return template.getFolderAsData(dir, true);
	})).then(itemsList => {
		let images = [];
		itemsList.forEach(items => {
			images = images.concat(items.filter(filename => {
				switch(path.extname(filename).toLowerCase()) {
					case '.png':
					case '.jpg':
						return true;
				}
				return false;
			}));
		});
		return loadImages(images);
	});
}

function fitImages(imageInfo, sheet, rectX, rectY, rectWidth, rectHeight,
		imageKeysSortedByWidth, imageKeysSortedByHeight, heightFirst) {
	if (!rectWidth || !rectHeight) {
		return 0;
	}
	let count = 0;
	const keys = heightFirst ? imageKeysSortedByHeight : imageKeysSortedByWidth;

	let imageAdded = false;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const imgData = imageInfo[key];
		const { fitted, width, height, image, scenes, font, scaleValue } = imgData;
		if (!fitted) {
			if (width <= rectWidth && height <= rectHeight) {
				imageAdded = true;
				imgData.fitted = true;
				sheet.push({ image, key, font, scenes, x: rectX, y: rectY, width: image.width, height: image.height, scaleValue });
				count++;

				if (heightFirst) {
					count += fitImages(imageInfo, sheet,
						rectX + width,
						rectY,
						rectWidth - width,
						height,
						imageKeysSortedByWidth,
						imageKeysSortedByHeight,
						true
					);
					
					count += fitImages(imageInfo, sheet,
						rectX,
						rectY + height,
						rectWidth,
						rectHeight - height,
						imageKeysSortedByWidth,
						imageKeysSortedByHeight,
						false
					);
				} else {
					count += fitImages(imageInfo, sheet,
						rectX + width,
						rectY,
						rectWidth - width,
						rectHeight,
						imageKeysSortedByWidth,
						imageKeysSortedByHeight,
						true
					);

					count += fitImages(imageInfo, sheet,
						rectX,
						rectY + height,
						width,
						rectHeight - height,
						imageKeysSortedByWidth,
						imageKeysSortedByHeight,
						false
					);

				}
				break;
			}
		}
	}
	if (!imageAdded) {
		sheet.push({x: rectX, y: rectY, width: rectWidth, height: rectHeight});
	}
	return count;
}

const regexScale = /\@(?<scale>\d+)x\./;

function rescaleImage(image, scale) {
	const key = (image.id || path.basename(image.src.replace(regexScale, '.'), '.png'));
	const canvas = createCanvas(image.width * scale, image.height * scale);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";

	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	canvas.id = key;

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const orgCanvas = createCanvas(image.width, image.height);
	const orgContext = orgCanvas.getContext("2d");
	orgContext.drawImage(image, 0, 0);
	const orgImageData = orgContext.getImageData(0, 0, orgCanvas.width, orgCanvas.height);
	createSDF(orgImageData, imageData);
	ctx.putImageData(imageData, 0, 0);
	return canvas;
}


const MARGIN = 8;

function arrangeImages(images, sheetWidth, sheetHeight) {
	const imageInfo = { };

	images.forEach(image => {
		const src = image.src;
		const rescale = image.src.indexOf("@") >= 0;
		let scaleValue = 1;
		if (rescale) {
			console.log(`Rescaling ${path.basename(image.src)}.`);
			const { groups: { scale } } = image.src.match(regexScale);
			if (!isNaN(scale) && scale && scale != 1) {
				scaleValue = parseInt(scale);
				image = rescaleImage(image, 1 / scale);
			}
		}

		const fontMatch = src.match(/generated\/assets\/fonts\/[a-zA-Z\-_]+\.[a-zA-Z]+/gm);
		const key = image.id || path.basename(image.src, '.png');
		const regexScene = /(?<scene>[\w\d-]+)\/assets\/[\w\d-@]+.[\w]+$/;
		const match = src ? src.match(regexScene) : null;
		const scene = match && match.groups.scene !== "generated" ? match.groups.scene : null;

		if (imageInfo[key]) {
			console.warn(`Duplicate keys: ${key}.`);
			if (imageInfo[key].scenes.indexOf(scene) < 0) {
				imageInfo[key].scenes.push(scene);
			}
			return;
		}
		imageInfo[key] = {
			key,
			scenes: [scene],
			width: Math.min(image.width + MARGIN, sheetWidth),
			height: Math.min(image.height + MARGIN, sheetHeight),
			image,
			sheetIndex: null,
			sheetX: 0,
			sheetY: 0,
			fitted: false,
			scaleValue,
			font: fontMatch ? true : false,
		}
	});

	const keys = Object.keys(imageInfo);
	const groups = [
		{
			sdf: false, 
			keys: keys.filter(k => imageInfo[k].scaleValue === 1 && !imageInfo[k].font),
		},
		{
			sdf: true, 
			keys: keys.filter(k => imageInfo[k].scaleValue !== 1 || imageInfo[k].font),
		},
	];

	const sheets = [];

	groups.forEach(({ sdf, keys }) => {
		const imageKeysSortedByWidth = keys;
		const imageKeysSortedByHeight = keys;
		imageKeysSortedByWidth.sort((a, b) => imageInfo[a].width < imageInfo[b].width ? 1 : imageInfo[a].width > imageInfo[b].width ? -1 : 0);
		imageKeysSortedByHeight.sort((a, b) => imageInfo[a].height < imageInfo[b].height ? 1 : imageInfo[a].height > imageInfo[b].height ? -1 : 0);

		let imagesCount = keys.length;
		while (imagesCount > 0) {
			const sheet = [];
			imagesCount -= fitImages(imageInfo, sheet,
				0, 0, sheetWidth, sheetHeight,
				imageKeysSortedByWidth,
				imageKeysSortedByHeight,
				sheetWidth > sheetHeight
			);
			sheets.push({
				sheet,
				sdf,
			});
		}
	});
	return sheets;
}

function deleteFolders(... folders) {
	return new Promise((resolve, reject) => {
		let count = folders.length;
		folders.forEach(folder => {
			rimraf(folder, () => {
				count--;
				if (count <= 0) {
					resolve();
				}
			});
		});
	});
}

function produceSpritesheets(assetDirectories, width, height) {
	return processDirectories(assetDirectories, width, height).then(({spritesheets, spritesheetInfos, sprites, size, freeCells}) => {
        const publicDir = 'docs/generated';
        const generatedDir = 'data/generated';
    	const spritesheetGroups = spritesheets.map((buffer, index) => {
    		return {
    			buffer,
    			temppath: `generated/spritesheets/sheet${index}.png`,
    			path: `${publicDir}/spritesheets/sheet${index}.png`,
    			url: `generated/spritesheets/sheet${index}.png`,
				sdf: spritesheetInfos[index].sdf,
    		};
    	});
    	const data = {
    		size,
			spritesheets: spritesheetGroups.map(({url, sdf}, index) => {
				return {
					url,
					sdf,
				};
			}),
			sprites,
			freeCells,
		};
		console.log("Processing images: ", data.spritesheets);
    	return Promise.all([
    		deleteFolders(`generated/spritesheets`)
    		.then(() => Promise.all([
    			fs.promises.mkdir(`generated/spritesheets`, { recursive: true }),
				fs.promises.mkdir(`${publicDir}/spritesheets`, { recursive: true }),
				fs.promises.mkdir(`generated/trimmed-spritesheets`, { recursive: true}),
			]))
			.then(() => Promise.all(spritesheetGroups.map(({buffer, temppath, path, sdf}, index) => {
				return fs.promises.writeFile(temppath, buffer)
					.then(() => new Promise((resolve, reject) => {
						const filename = temppath;
						const filenameOut = `generated/trimmed-spritesheets/sheet${index}.png`
						trimImage(filename, filenameOut, {
							top: false, left: false, right: true, bottom: true
						}, error => {
							if (error) {
								reject(error);
					        } else {
					        	resolve(filenameOut);
					        }
						});
					}))
					.then(filename => {
						console.log("Trimmed sheet:", filename);
						return new Promise((resolve) => {
							setTimeout(() => {
								console.log("Starting compressing in 1 sec:", filename);
								resolve(filename);
							}, 1000);
						});
					})
					.then(filename => {
						console.log(`Optimizing ${filename} with ${sdf ? "opti-png" : "png-quant"}`);
						return filename;
					})
					.then(filename => imagemin([filename], {
						destination: `${publicDir}/spritesheets`,
						plugins: sdf ? [ imageminOptipng() ] : [ imageminPngquant({
							strip: true,
							quality: [0.5, 1],
							verbose: true,
						}) ],
					}));
			}))),
    		fs.promises.mkdir(`${generatedDir}`, { recursive: true })
    			.then(() => fs.promises.writeFile(`${generatedDir}/imagedata.json`, JSON.stringify(data, null, '\t'))
    		),
		]).then(() => data);
	});
}

function createFontSheet({name, characters, cellSize, fontSize, finalCellSize}) {
	if (!cellSize) cellSize = 256;
	if (!fontSize) fontSize = 160;
	if (!finalCellSize) finalCellSize = 32;
    const cols = Math.ceil(Math.sqrt(characters.length));
    const rows = Math.ceil(characters.length / cols);

	const stampCanvas = createCanvas(cellSize, cellSize);
	const stampCtx = stampCanvas.getContext('2d');
	stampCtx.fillStyle = "#ffffff";
	stampCtx.font = `${fontSize}px ${name}`;

	const sheetCanvas = createCanvas(cols * finalCellSize, rows * finalCellSize);
	const sheetCtx = sheetCanvas.getContext('2d');
	const letterInfo = {};

	for (let i = 0; i < characters.length; i++) {
		const letter = characters.charAt(i);
		stampCtx.clearRect(0, 0, cellSize, cellSize);
		stampCtx.fillText(letter, cellSize/2 - fontSize/2, cellSize/2 + fontSize/3);
		const stampImageData = stampCtx.getImageData(0, 0, cellSize, cellSize);
		const x = (i % cols) * finalCellSize;
		const y = Math.floor(i / cols) * finalCellSize;
		const imageData = sheetCtx.getImageData(x, y, finalCellSize, finalCellSize);

		const { letterWidth, letterHeight } = createSDF(stampImageData, imageData);
		console.log(`Created SDF for letter ${i}: ${letter}.`)

		sheetCtx.putImageData(imageData, x, y);
		letterInfo[letter] = { letter, index: i, width: letterWidth / cellSize, height: letterHeight / cellSize };
	}

	return {
		buffer: sheetCanvas.toBuffer(),
		letterInfo,
	};
}

function processDirectories(dirs, width, height) {
	const freeCells = [];
	return loadImagesFromPath(dirs).then(images => {
		const sheets = arrangeImages(images, width, height);

		const spritesheets = [];
		const sprites = {};
		const spritesheetInfos = sheets.map(({sdf}) => {
			return { sdf };
		});
		sheets.forEach(({sheet}, index) => {
			let maxWidth = 0, maxHeight = 0;
			sheet.forEach(({image,x,y}) => {
				if (image) {
					const {width,height} = image;
					maxWidth = Math.max(maxWidth, x + width);
					maxHeight = Math.max(maxHeight, y + height);
				}
			});

			const canvas = createCanvas(maxWidth, maxHeight);
			const ctx = canvas.getContext('2d');
			sheet.forEach(({image, scenes, x, y, width, height, key, font, scaleValue}) => {
				if (image) {
					ctx.drawImage(image, x, y);
					sprites[key] = {
						scenes,
						rect: [x, y, image.width, image.height],
						index,
					};
					if (font) {
						sprites[key].font = true;
					}
					if (scaleValue !== 1) {
						sprites[key].scale = scaleValue;
					}
				} else {
					freeCells.push({
						rect: [x, y, width, height],
						index,
					});
				}
			});
			spritesheets.push(canvas.toBuffer());
		});
		return { spritesheets, spritesheetInfos, sprites, size: [width, height], freeCells };
	});
}

function getSha(src) {
	return new Promise((resolve, reject) => {
		sha256File(src, (error, sum) => {
			if (error) reject(error);
			const key = path.basename(src, '.png');
			resolve(`${key}=${sum}`);
		});
	});
}

function getAssetsSha(...dirs) {
	return Promise.all(dirs.map(dir => {
			if (dir.charAt(dir.length-1) !== "/") {
				dir += "/";
			}
			return template.getFolderAsData(dir, true);
		}))
		.then(itemsList => {
			let images = [];
			itemsList.forEach(items => {
				images = images.concat(items.filter(filename => {
					switch(path.extname(filename).toLowerCase()) {
						case '.png':
						case '.jpg':
							return true;
					}
					return false;
				}));
			});
			return images;
		})
		.then(images => Promise.all(images.map(getSha)))
		.then(shaData => {
			shaData.sort();
			return shaData;
		});
}

module.exports = {
	deleteFolders,
	produceSpritesheets,
	getAssetsSha,
	createFontSheet,
};