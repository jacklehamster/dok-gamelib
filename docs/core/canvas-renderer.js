/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
CanvasRenderer 


*/

class CanvasRenderer {
	constructor(spriteDataProcessor, spritesheetManager, {imagedata, game}) {
		this.spriteDataProcessor = spriteDataProcessor;
		this.spritesheetManager = spritesheetManager;
		this.imagedata = imagedata;
	}

	getSpriteInfo(id) {
		return this.spriteDataProcessor.data[id];
	}

	drawToCanvas(id, px, py, size, canvas, animationIndex) {
		const { rect, index } = this.imagedata.sprites[id];
		const [ x, y, width, height ] = rect;
		const spriteInfo = this.getSpriteInfo(id);
		const grid = spriteInfo ? spriteInfo.grid : null;
		const spriteSize = spriteInfo ? spriteInfo.spriteSize : null;


		const context = canvas.getContext("2d");
		//	load texture
		this.spritesheetManager.fetchImages()
			.then(images => {
				const image = images[index];
				const cols = grid ? grid[0] : 1;
				const rows = grid ? grid[1] : 1;
				const spriteWidth = spriteSize && spriteSize[0] ? spriteSize[0] : width / (cols || 1);
				const spriteHeight = spriteSize && spriteSize[1] ? spriteSize[1] : height / (rows || 1);
				const col = typeof(animationIndex) !== "undefined" ? animationIndex % cols : 0;
				const row = typeof(animationIndex) !== "undefined" ? Math.floor(animationIndex / cols) : 0;
				const scale = Math.min(size / spriteWidth, size / spriteHeight);

				context.drawImage(image,
					x + col * spriteWidth,
					y + row * spriteHeight,
					spriteWidth,
					spriteHeight,
					px,
					py,
					spriteWidth * scale,
					spriteHeight * scale);
			})
			.catch(errors => console.error(errors));
	}
}
