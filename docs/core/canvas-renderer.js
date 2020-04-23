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
	constructor(spriteDataProcessor, {imagedata, game}) {
		this.spriteDataProcessor = spriteDataProcessor;
		this.imagedata = imagedata;
	}

	drawToCanvas(id, px, py, size, canvas, grid, animationIndex) {
		const { rect, index } = this.imagedata.sprites[id];
		const [ x, y, width, height ] = rect;

		const context = canvas.getContext("2d");
		//	load texture
		Utils.load([ this.imagedata.spritesheets[index] ], {
			error: errors => {
				console.errors(errors);
			},
			complete: ([image]) => {
				const cols = grid ? grid[0] : 1;
				const rows = grid ? grid[1] : 1;
				const spriteWidth = width / (cols || 1);
				const spriteHeight = height / (rows || 1);
				const col = typeof(animationIndex) !== "undefined" ? animationIndex % cols : 0;
				const row = typeof(animationIndex) !== "undefined" ? Math.floor(animationIndex / cols) : 0;
				const scale = Math.min(size / spriteWidth, size / spriteHeight);

				context.drawImage(image, x + col * spriteWidth, y + row * spriteHeight, spriteWidth, spriteHeight, px, py, spriteWidth * scale, spriteHeight * scale);
			},
		});			
	}
}
