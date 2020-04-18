/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
  *		AnimatedSprite
  */

class AnimatedSpriteInstance extends ImageSpriteInstance {
	constructor() {
		super();
		this.animation = {
			start: 0,
			range: 0,
		};

		this.animationData = {
			spriteSize: [ 0, 0 ],
			grid: [ 0, 0 ],
			padding: 0,
			frameRate: 0,
		};
		this.crop = [0, 0];
		this.circleRadius = 0;
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { animation, grid, brightness, padding, spriteSize, crop, circleRadius } = definition;
		const { instanceIndex, updateTimes, animationData, src } = this;
		const { now } = game;

		const cropX = crop[0].get(instanceIndex);
		const cropY = crop[1].get(instanceIndex);
		const cropWidth = crop[2].get(instanceIndex);
		const cropHeight = crop[3].get(instanceIndex);
		if (!Utils.equal4(this.crop, cropX, cropY, cropWidth, cropHeight)) {
			Utils.set4(this.crop, cropX, cropY, cropWidth, cropHeight);
			updateTimes.crop = now;
		}		

		const newBrightness = brightness.get(instanceIndex);
		if (newBrightness !== this.brightness) {
			this.brightness = newBrightness;
			updateTimes.brightness = now;
		}

		const newCircleRadius = circleRadius.get(instanceIndex);
		if (newCircleRadius !== this.circleRadius) {
			this.circleRadius = newCircleRadius;
			updateTimes.circleRadius = now;
		}

		const animationProcessorData = game.engine.animationProcessor.data[src];
		if (animationProcessorData) {
			const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, frameRate, animations } = animationProcessorData;
			const newPadding = padding;
			if (newPadding !== animationData.padding) {
				animationData.padding = newPadding;
				updateTimes.padding = now;
			}

			if (animationData.spriteSize[0] !== spriteWidth || animationData.spriteSize[1] !== spriteHeight) {
				animationData.spriteSize[0] = spriteWidth;
				animationData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			const animCols = cols;
			const animRows = rows;
			if (animationData.grid[0] !== animCols || animationData.grid[1] !== animRows) {
				animationData.grid[0] = animCols;
				animationData.grid[1] = animRows;
				updateTimes.grid = now;
			}

			const animFrameRate = frameRate;
			if (animationData.frameRate !== animFrameRate) {
				animationData.frameRate = animFrameRate;
				updateTimes.frameRate = now;
			}
		} else {
			const spriteWidth = spriteSize[0].get(instanceIndex);
			const spriteHeight = spriteSize[1].get(instanceIndex);
			if (this.animationData.spriteSize[0] !== spriteWidth || this.animationData.spriteSize[1] !== spriteHeight) {
				this.animationData.spriteSize[0] = spriteWidth;
				this.animationData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			const animCols = grid[0].get(instanceIndex);
			const animRows = grid[1].get(instanceIndex);
			if (this.animationData.grid[0] !== animCols || this.animationData.grid[1] !== animRows) {
				this.animationData.grid[0] = animCols;
				this.animationData.grid[1] = animRows;
				updateTimes.grid = now;
			}
			
			const newPadding = padding.get(instanceIndex);
			if (newPadding !== this.animationData.padding) {
				this.animationData.padding = newPadding;
				updateTimes.padding = now;
			}

			const animFrameRate = animation.frameRate.get(instanceIndex);
			if (animationData.frameRate !== animFrameRate) {
				animationData.frameRate = animFrameRate;
				updateTimes.frameRate = now;
			}
		}

		const animStart = animation.start.get(instanceIndex);
		const animRange = animation.range.get(instanceIndex);
		const spriteAnim = this.animation;
		if (spriteAnim.start !== animStart || spriteAnim.range !== animRange) {
			spriteAnim.start = animStart;
			spriteAnim.range = animRange;
			updateTimes.animation = now;
		}
	}

	updateChunkGrid(chunk, now) {
		const { grid: [ cols, rows ] } = this.animationData;
		chunk.setGrid(cols, rows, now);
	}

	updateChunkTexture(renderer, chunk, now) {
		const { src, animationData: { spriteSize, grid, padding }, crop, scale, brightness, circleRadius } = this;

		if (!src) {
			chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
		} else {
			const spriteData = renderer.imagedata.sprites[src] || renderer.textureManager.getVideoTexture(src);
			if (!spriteData) {
				const error = `Unknown sprite ${src}.`;
				if (game.lastError !== error) {
					game.lastError = error;
					console.warn(game.lastError);
				}
				chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
				this.src = null;
				return;
			}

			const { rect: [ x, y, sheetWidth, sheetHeight ], index } = spriteData;

			const animationData = game.engine.animationProcessor.data[src];
			if (animationData) {
				const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = animationData;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
			} else {
				const [ cols, rows ] = grid;
				const [ spriteWidth, spriteHeight ] = spriteSize;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
			}
		}
	}

	updateChunkAnimation(chunk, now) {
		const { animation, animationData: { frameRate } } = this;
		const { start, range } = animation;
		chunk.setAnimation(start, range, frameRate, now);
	}

	updateChunk(renderer, chunk, now) {
		super.updateChunk(renderer, chunk, now);
		const { updateTimes } = this;
		if (updateTimes.grid === now) {
			this.updateChunkGrid(chunk, now);
		}

		if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now
			|| updateTimes.spriteSize === now || updateTimes.crop === now || updateTimes.circleRadius
			|| updateTimes.grid === now) {
			this.updateChunkTexture(renderer, chunk, now);
		}

		if (updateTimes.animation === now || updateTimes.frameRate === now) {
			this.updateChunkAnimation(chunk, now);
		}
	}
}