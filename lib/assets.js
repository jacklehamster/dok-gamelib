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
		const { fitted, width, height, image } = imgData;
		if (!fitted) {
			if (width <= rectWidth && height <= rectHeight) {
				imageAdded = true;
				imgData.fitted = true;
				sheet.push({ image, key, x: rectX, y: rectY, width: image.width, height: image.height });
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

const regex = /\@(?<scale>\d+)x\./;

function rescaleImage(image, scale) {
	const key = (image.id || path.basename(image.src.replace(regex, '.'), '.png'));
	const canvas = createCanvas(image.width * scale, image.height * scale);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";

	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	canvas.id = key;

	// const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// const orgCanvas = createCanvas(image.width, image.height);
	// const orgContext = orgCanvas.getContext("2d");
	// orgContext.drawImage(image, 0, 0);
	// const orgImageData = orgContext.getImageData(0, 0, orgCanvas.width, orgCanvas.height);
	// createSDF(orgImageData, imageData);
	// ctx.putImageData(imageData, 0, 0);

	return canvas;
}


const MARGIN = 8;

function arrangeImages(images, sheetWidth, sheetHeight) {
	const imageInfo = { };

	images.forEach(image => {
		if (image.src.indexOf("@") >= 0) {
			const { groups: { scale } } = image.src.match(regex);
			image = rescaleImage(image, 1 / scale);
		}

		const key = image.id || path.basename(image.src, '.png');
		if (imageInfo[key]) {
			console.warn(`Duplicate keys: ${key}.`);
		}
		imageInfo[key] = {
			key,
			width: Math.min(image.width + MARGIN, sheetWidth),
			height: Math.min(image.height + MARGIN, sheetHeight),
			image,
			sheetIndex: null,
			sheetX: 0,
			sheetY: 0,
			fitted: false,
		}
	});

	const imageKeysSortedByWidth = Object.keys(imageInfo);
	const imageKeysSortedByHeight = Object.keys(imageInfo);
	imageKeysSortedByWidth.sort((a, b) => imageInfo[a].width < imageInfo[b].width ? 1 : imageInfo[a].width > imageInfo[b].width ? -1 : 0);
	imageKeysSortedByHeight.sort((a, b) => imageInfo[a].height < imageInfo[b].height ? 1 : imageInfo[a].height > imageInfo[b].height ? -1 : 0);

	let imagesCount = Object.values(imageInfo).length;
	let sheets = [];
	while (imagesCount > 0) {
		const sheet = [];
		imagesCount -= fitImages(imageInfo, sheet,
			0, 0, sheetWidth, sheetHeight,
			imageKeysSortedByWidth,
			imageKeysSortedByHeight,
			sheetWidth > sheetHeight
		);
		sheets.push(sheet);
	}
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
	return processDirectories(assetDirectories, width, height).then(({spritesheets, sprites, size, freeCells}) => {
        const publicDir = 'docs/generated';
        const generatedDir = 'data/generated';
    	const spritesheetGroups = spritesheets.map((buffer, index) => {
    		return {
    			buffer,
    			temppath: `generated/spritesheets/sheet${index}.png`,
    			path: `${publicDir}/spritesheets/sheet${index}.png`,
    			url: `generated/spritesheets/sheet${index}.png`,
    		};
    	});
    	const data = {
    		size,
			spritesheets: spritesheetGroups.map(({url}) => url),
			sprites,
			freeCells,
		};
    	return Promise.all([
    		deleteFolders(`generated/spritesheets`)
    		.then(() => Promise.all([
    			fs.promises.mkdir(`generated/spritesheets`, { recursive: true }),
				fs.promises.mkdir(`${publicDir}/spritesheets`, { recursive: true }),
			]))
			.then(() => Promise.all(spritesheetGroups.map(({buffer, temppath, path}) => {
				return fs.promises.writeFile(temppath, buffer);
			})))
			.then(() => new Promise((resolve, reject) => {
				compress_images(`generated/spritesheets/*.png`, `${publicDir}/spritesheets/`, { compress_force: false, statistic: true, autoupdate: false }, false,
					{jpg: {engine: 'jpegtran', command: false}},
                    {png: {engine: 'pngquant', command: ['--quality=20-100']}},
                    {svg: {engine: false, command: false}},
                    {gif: {engine: false, command: false}},
    			(error, completed, statistic) => {
					console.log('-------------');
	                console.log(error);
	                console.log(completed);
	                console.log(statistic);
	                console.log('-------------');
	                if (completed) {
		                resolve();
	                } else if (error) {
	                	reject(error);
	                }
    			});
			})),
    		fs.promises.mkdir(`${generatedDir}/config`, { recursive: true })
    			.then(() => fs.promises.writeFile(`${generatedDir}/config/imagedata.json`, JSON.stringify(data, null, '\t'))
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
		sheets.forEach((sheet, index) => {
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
			sheet.forEach(({image, x, y, width, height, key}) => {
				if (image) {
					ctx.drawImage(image, x, y);
					sprites[key] = {
						offset: [x, y],
						size: [image.width, image.height],
						index,
					};
				} else {
					freeCells.push({
						offset: [x, y],
						size: [width, height],
						index,
					});
				}
			});
			spritesheets.push(canvas.toBuffer());
		});
		return { spritesheets, sprites, size: [width, height], freeCells };
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