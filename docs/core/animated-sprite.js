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

		const animFrame = animation.frame.get(definition, instanceIndex);
		const animStart = animation.start.get(definition, instanceIndex);
		const animRange = animation.range.get(definition, instanceIndex);
		const animFrameRate = animation.frameRate.get(definition, instanceIndex);

		const spriteAnim = this.animation;
		if (spriteAnim.frame !== animFrame || spriteAnim.start !== animStart || spriteAnim.range !== animRange || spriteAnim.frameRate !== animFrameRate) {
			spriteAnim.frame = animFrame;
			spriteAnim.start = animStart;
			spriteAnim.range = animRange;
			spriteAnim.frameRate = animFrameRate;
			updateTimes.animation = now;
		}
		const animCols = grid[0].get(definition, instanceIndex);
		const animRows = grid[1].get(definition, instanceIndex);
		if (this.grid[0] !== animCols || this.grid[1] !== animRows) {
			this.grid[0] = animCols;
			this.grid[1] = animRows;
			updateTimes.grid = now;
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { src, animation, grid, scale, updateTimes } = this;
		if (updateTimes.grid === now) {
			const [ cols, rows ] = grid;
			chunk.setGrid(cols, rows, now);
		}
		if (updateTimes.src === now || updateTimes.scale === now) {
			if (!src) {
				chunk.setTexture(0, 0, 0, 0, scale, now);
			} else {
				const spriteData = engine.imagedata.sprites[src];
				if (!spriteData) {
					console.error(`Invalid image ${src}.`);
				}
				const { offset, size, index } = spriteData;
				const [ sheetWidth, sheetHeight ] = size;
				const [ cols, rows ] = grid;

				chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows, scale, now);
			}
		}
		if (updateTimes.grid === now || updateTimes.animation === now) {
			const { frame, start, range, frameRate } = animation;
			const [ cols, rows ] = grid;
			chunk.setAnimation(frame, start, range, frameRate, now);
		}
	}
}