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

function getSDFCells(imageData) {
	const { width, height } = imageData;
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
	return { cells, letterWidth: Math.max(rightPixel-leftPixel+1, 0), letterHeight: Math.max(bottomPixel-topPixel+1, 0) };
}

function createSDF(fromImageData, toImageData) {
	const { cells, letterWidth, letterHeight } = getSDFCells(fromImageData);
	const xmul = fromImageData.width / toImageData.width;
	const ymul = fromImageData.height / toImageData.height;
	for (let py = 0; py < toImageData.height; py++) {
		for (let px = 0; px < toImageData.width; px++) {
			const { dist, inside } = cells[Math.floor((py * ymul + ymul/2) * fromImageData.width + px * xmul + xmul/2)];
			const signedDist = inside ? dist : -dist;
			const pixel = getPixelData(toImageData, px, py);
			const color = Math.max(0, Math.min(0xFF, Math.round(256 * .5 + signedDist * 3)));
			pixel[0] = 0xFF;
			pixel[1] = 0xFF;
			pixel[2] = 0xFF;
			pixel[3] = color;
		}
	}
	return { letterWidth, letterHeight };
}


module.exports = {
	createSDF,
};