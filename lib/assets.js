const fs = require('fs');
const path = require('path');
const imageSize = require('image-size');
const { createCanvas, loadImage, registerFont, Image } = require('canvas');
const crypto = require('crypto');
const rimraf = require("rimraf");
const sha256File = require('sha256-file');

const template = require('./template');


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
	return new Promise((resolve, reject) => {
		Promise.all(dirs.map(dir => {
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
			loadImages(images).then(resolve);
		});
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

const MARGIN = 20;

function arrangeImages(images, sheetWidth, sheetHeight) {
	const imageInfo = { };
	images.forEach(image => {
		const key = image.id || path.basename(image.src, '.png');
		if (imageInfo[key]) {
			console.warn(`Duplicate keys: ${key}.`);
		}
		imageInfo[key] = {
			key,
			width: image.width + MARGIN,
			height: image.height + MARGIN,
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
		return new Promise((resolve, reject) => {
	        const publicDir = 'docs/generated';
	        const generatedDir = 'data/generated';
        	const spritesheetGroups = spritesheets.map((buffer, index) => {
        		return {
        			buffer,
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
        		fs.promises.mkdir(`${publicDir}/spritesheets`, { recursive: true })
        			.then(() => Promise.all(spritesheetGroups.map(({buffer, path}) => fs.promises.writeFile(path, buffer)))
        		),
        		fs.promises.mkdir(`${generatedDir}/config`, { recursive: true })
        			.then(() => fs.promises.writeFile(`${generatedDir}/config/imagedata.json`, JSON.stringify(data, null, '\t'))
        		),
    		]).then(() => {
	   			resolve(data);
    		});
		});
	});
};


function getPixelData(imageData, x, y) {
	return imageData.data.subarray((x + y * imageData.width) * 4, (x + y * imageData.width + 1) * 4);
}

function isBorder(imageData, x, y) {
	const center = getPixelData(imageData, x, y)[0] < 128;;
	const left = getPixelData(imageData, x-1, y)[0] < 128;
	const right = getPixelData(imageData, x+1, y)[0] < 128;
	const top = getPixelData(imageData, x, y-1)[0] < 128;
	const down = getPixelData(imageData, x, y+1)[0] < 128;
	return center !== left || center !== right || center !== top || center !== down;
}

function isOutOfBound(x, y, width, height) {
	return x < 0 || y < 0 || x >= width || y >= height;
}

function getCell(cells, x, y, width, height) {
	return isOutOfBound(x, y, width, height) ? null : cells[y * width + x];
}

function checkDist(cell, border) {
	const { x, y } = cell;
	const [ bx, by ] = border;
	const dx = x - bx;
	const dy = y - by;
	const dist = Math.sqrt(dx*dx + dy*dy);
	if (dist < cell.dist) {
		cell.closest = border;
		cell.dist = dist;
	}
}

function propagate(cell, cells, collector, width, height) {
	const { x, y } = cell;
	const neighbors = [
		getCell(cells, x-1, y, width, height),
		getCell(cells, x+1, y, width, height),
		getCell(cells, x, y-1, width, height),
		getCell(cells, x, y+1, width, height),
	];
	neighbors.forEach((neighbor, index) => {
		const f = 1<<index;
		if (neighbor && (cell.flag & f) === 0) {
			cell.flag |= f;
			checkDist(neighbor, cell.closest);
			collector.push(neighbor);
		}
	});
}

function propagateAll(borders, cells, width, height) {
	if (borders.length === 0) {
		return;
	}
	const collector = [];
	borders.forEach((cell) => {
		propagate(cell, cells, collector, width, height);
	});
	propagateAll(collector, cells, width, height);
}

function getSDFCells(ctx, width, height) {
	const imageData = ctx.getImageData(0, 0, width, height);
	const cells = new Array(width * height);
	const borders = [];
	let leftPixel = width-1, topPixel = height-1, rightPixel = 0, bottomPixel = 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const pixel = getPixelData(imageData, x, y);
			const border = x === 0 || y === 0 || x === width-1 || y === height-1 ? false : isBorder(imageData, x, y);
			const inside = pixel[0] >= 128;
			const cell = cells[y * width + x] = {
				x,
				y,
				border,
				inside,
				pixel,
				closest: border ? [x, y] : null,
				dist: border ? 0 : 100000,
				flag: 0,
			};
			if (border) {
				borders.push(cell);
			}

			if (inside) {
				leftPixel = Math.min(leftPixel, x);
				topPixel = Math.min(topPixel, y);
				rightPixel  = Math.max(rightPixel, x);
				bottomPixel = Math.max(bottomPixel, y);
			}
		}
	}
	propagateAll(borders, cells, width, height);
	return { cells, width: Math.max(rightPixel-leftPixel+1, 0), height: Math.max(bottomPixel-topPixel+1, 0) };
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
		const { cells, width, height } = getSDFCells(stampCtx, cellSize, cellSize);

		const x = (i % cols) * finalCellSize;
		const y = Math.floor(i / cols) * finalCellSize;
		const imageData = sheetCtx.getImageData(x, y, finalCellSize, finalCellSize);
		const mul = cellSize / finalCellSize;
		for (let py = 0; py < finalCellSize; py++) {
			for (let px = 0; px < finalCellSize; px++) {
				const { dist, inside } = cells[Math.floor((py * mul + mul/2) * cellSize + px * mul + mul/2)];
				const signedDist = inside ? dist : -dist;

				const pixel = getPixelData(imageData, px, py);
				const color = Math.max(0, Math.min(0xFF, Math.round(256 * .5 + signedDist * 3)));
				pixel[0] = 0xFF;
				pixel[1] = 0xFF;
				pixel[2] = 0xFF;
				pixel[3] = color;
			}
		}
		sheetCtx.putImageData(imageData, x, y);
		letterInfo[letter] = { letter, index: i, width: width / cellSize, height: height / cellSize };
	}

	return {
		buffer: sheetCanvas.toBuffer(),
		letterInfo,
	};
}

function processDirectories(dirs, width, height) {
	return new Promise((resolve, reject) => {
		const freeCells = [];
		loadImagesFromPath(dirs).then(images => {
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
			resolve({ spritesheets, sprites, size: [width, height], freeCells });
		});
	});
}

function getSha(src) {
	return new Promise((resolve, reject) => {
		sha256File(src, (error, sum) => {
			if (error) reject(error);
			const key = path.basename(src, '.png');
			resolve(`${key}=${sum}`);
		})

	});
}

function getAssetsSha(...dirs) {
	return new Promise((resolve, reject) => {
		Promise.all(dirs.map(dir => {
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
			Promise.all(images.map(getSha)).then(shaData => {
				shaData.sort();
				resolve(shaData);
    		});
		});
	});
}

module.exports = {
	deleteFolders,
	produceSpritesheets,
	getAssetsSha,
	createFontSheet,
};