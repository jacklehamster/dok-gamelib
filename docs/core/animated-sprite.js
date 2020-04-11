/**
  *		AnimatedSprite
  */

class AnimatedSpriteInstance extends ImageSpriteInstance {
	constructor() {
		super();
		this.animation = {
			frame: 0,
			start: 0,
			range: 0,
			frameRate: 0,
		};
		this.grid = [0, 0];
		this.spriteSize = [0, 0];
		this.crop = [0, 0];
		this.padding = 0;
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { animation, grid, brightness, padding, spriteSize, crop } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;

		const animFrame = animation.frame.get(instanceIndex);
		const animStart = animation.start.get(instanceIndex);
		const animRange = animation.range.get(instanceIndex);
		const animFrameRate = animation.frameRate.get(instanceIndex);

		const spriteAnim = this.animation;
		if (spriteAnim.frame !== animFrame || spriteAnim.start !== animStart || spriteAnim.range !== animRange || spriteAnim.frameRate !== animFrameRate) {
			spriteAnim.frame = animFrame;
			spriteAnim.start = animStart;
			spriteAnim.range = animRange;
			spriteAnim.frameRate = animFrameRate;
			updateTimes.animation = now;
		}
		const spriteWidth = spriteSize[0].get(instanceIndex);
		const spriteHeight = spriteSize[1].get(instanceIndex);
		if (this.spriteSize[0] !== spriteWidth || this.spriteSize[1] !== spriteHeight) {
			this.spriteSize[0] = spriteWidth;
			this.spriteSize[1] = spriteHeight;
			updateTimes.spriteSize = now;
		}

		const cropX = crop[0].get(instanceIndex);
		const cropY = crop[1].get(instanceIndex);
		const cropWidth = crop[2].get(instanceIndex);
		const cropHeight = crop[3].get(instanceIndex);
		if (!Utils.equal4(this.crop, cropX, cropY, cropWidth, cropHeight)) {
			Utils.set4(this.crop, cropX, cropY, cropWidth, cropHeight);
			updateTimes.crop = now;
		}		

		const animCols = grid[0].get(instanceIndex);
		const animRows = grid[1].get(instanceIndex);
		if (this.grid[0] !== animCols || this.grid[1] !== animRows) {
			this.grid[0] = animCols;
			this.grid[1] = animRows;
			updateTimes.grid = now;
		}
		const newBrightness = brightness.get(instanceIndex);
		if (newBrightness !== this.brightness) {
			this.brightness = newBrightness;
			updateTimes.brightness = now;
		}
		const newPadding = padding.get(instanceIndex);
		if (newPadding !== this.padding) {
			this.padding = newPadding;
			updateTimes.padding = now;
		}
	}

	updateChunkGrid(chunk, now) {
		const { grid } = this;
		const [ cols, rows ] = grid;
		chunk.setGrid(cols, rows, now);
	}

	updateChunkTexture(renderer, chunk, now) {
		const { src, grid, crop, spriteSize, scale, brightness, padding } = this;

		if (!src) {
			chunk.setTexture(0, 0, 0, 0, scale, brightness, padding, now);
		} else {
			const spriteData = renderer.imagedata.sprites[src] || renderer.textureManager.getVideoTexture(src);
			if (!spriteData) {
				console.error(`Invalid image ${src}.`);
			}
			const { rect, index } = spriteData;
			const [ x, y, sheetWidth, sheetHeight ] = rect;
			const [ cols, rows ] = grid;
			const [ spriteWidth, spriteHeight ] = spriteSize;

			chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, now);
		}
	}

	updateChunkAnimation(chunk, now) {
		const { animation, grid } = this;

		const { frame, start, range, frameRate } = animation;
		const [ cols, rows ] = grid;
		chunk.setAnimation(frame, start, range, frameRate, now);
	}

	updateChunk(renderer, chunk, now) {
		super.updateChunk(renderer, chunk, now);
		const { updateTimes } = this;
		if (updateTimes.grid === now) {
			this.updateChunkGrid(chunk, now);
		}
		if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now || updateTimes.spriteSize === now || updateTimes.crop === now) {
			this.updateChunkTexture(renderer, chunk, now);
		}
		if (updateTimes.grid === now || updateTimes.animation === now) {
			this.updateChunkAnimation(chunk, now);
		}
	}
}