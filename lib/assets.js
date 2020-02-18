const fs = require('fs');
const path = require('path');
const imageSize = require('image-size');
const { createCanvas, loadImage, registerFont, Image } = require('canvas');
const crypto = require('crypto');
const rimraf = require("rimraf");

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

function loadImagesFromPath(dir) {
	if (dir.charAt(dir.length-1) !== "/") {
		dir += "/";
	}
	return new Promise((resolve, reject) => {
		fs.readdir(dir, function(err, items) {
			loadImages(items.filter(filename => path.extname(filename) === '.png').map(name => `${dir}${name}`))
				.then(resolve);
		});
	});
}

function fitImages(imageInfo, sheet, rectX, rectY, rectWidth, rectHeight,
		imageKeysSortedByWidth, imageKeysSortedByHeight, heightFirst) {
	let count = 0;
	const keys = heightFirst ? imageKeysSortedByHeight : imageKeysSortedByWidth;

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const imgData = imageInfo[key];
		const { fitted, width, height, image } = imgData;
		if (!fitted) {
			if (width <= rectWidth && height <= rectHeight) {
				imgData.fitted = true;
				sheet.push({
					image, x: rectX, y: rectY,
				});
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
	return count;
}

function arrangeImages(images, sheetWidth, sheetHeight) {
	const imageInfo = { };
	images.forEach(image => {
		const key = path.basename(image.src);
		imageInfo[key] = {
			width: image.width,
			height: image.height,
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

	let imagesCount = images.length;
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

function produceSpritesheets(assetDirectory, width, height) {
	return processDirectory(assetDirectory, width, height).then(({spritesheets, data, size}) => {
		return new Promise((resolve, reject) => {
	        const publicDir = 'public/generated';
	        const generatedDir = 'data/generated';
        	const spritesheetGroups = spritesheets.map((buffer, index) => {
        		return {
        			buffer,
        			path: `${publicDir}/spritesheets/sheet${index}.png`,
        			url: `generated/spritesheets/sheet${index}.png`,
        		};
        	});
        	const jsonConfig = {
        		size,
				spritesheets: spritesheetGroups.map(({url}) => url),
				sprites: data,
			};

        	Promise.all([
        		fs.promises.mkdir(`${publicDir}/spritesheets`, { recursive: true })
        			.then(() => Promise.all(spritesheetGroups.map(({buffer, path}) => fs.promises.writeFile(path, buffer)))
        		),
        		fs.promises.mkdir(`${generatedDir}/config`, { recursive: true })
        			.then(() => fs.promises.writeFile(`${generatedDir}/config/imagedata.json`, JSON.stringify(jsonConfig, null, '\t'))
        		),
    		]).then(() => {
    			resolve({ spritesheets, data: jsonConfig});
    		});
		});
	});
};

function processDirectory(dir, width, height) {
	return new Promise((resolve, reject) => {
		loadImagesFromPath(dir).then(images => {
			const sheets = arrangeImages(images, width, height);

			const spritesheets = [];
			const data = {};
			sheets.forEach((sheet, index) => {
				const canvas = createCanvas(width, height);
				const ctx = canvas.getContext('2d');
				sheet.forEach(({image, x, y}) => {
					ctx.drawImage(image, x, y);
					const filename = path.basename(image.src, '.png');
					data[filename] = {
						offset: [x, y],
						size: [image.width, image.height],
						index,
					};
				});
				spritesheets.push(canvas.toBuffer());
			});
			resolve({ spritesheets, data, size: [width, height] });
		});
	});
}

module.exports = {
	deleteFolders,
	produceSpritesheets,
};