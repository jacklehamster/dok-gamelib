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
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { animation, grid } = definition;
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
		const animCols = grid[0].get(instanceIndex);
		const animRows = grid[1].get(instanceIndex);
		if (this.grid[0] !== animCols || this.grid[1] !== animRows) {
			this.grid[0] = animCols;
			this.grid[1] = animRows;
			updateTimes.grid = now;
		}
	}

	updateChunkGrid(chunk, now) {
		const { grid } = this;
		const [ cols, rows ] = grid;
		chunk.setGrid(cols, rows, now);
	}

	updateChunkTexture(renderer, chunk, now) {
		const { src, grid, scale } = this;

		if (!src) {
			chunk.setTexture(0, 0, 0, 0, scale, now);
		} else {
			const spriteData = renderer.imagedata.sprites[src] || renderer.textureManager.getVideoTexture(src);
			if (!spriteData) {
				console.error(`Invalid image ${src}.`);
			}
			const { offset, size, index } = spriteData;
			const [ sheetWidth, sheetHeight ] = size;
			const [ cols, rows ] = grid;

			chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows, scale, now);
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
		if (updateTimes.src === now || updateTimes.scale === now) {
			this.updateChunkTexture(renderer, chunk, now);
		}
		if (updateTimes.grid === now || updateTimes.animation === now) {
			this.updateChunkAnimation(chunk, now);
		}
	}
}