/**
  *		AnimatedSprite
  */

class AnimatedSprite extends ImageSprite {
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
		const { animation, grid } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;

		const animFrame = game.evaluate(animation.frame, definition, instanceIndex);
		const animStart = game.evaluate(animation.start, definition, instanceIndex);
		const animRange = game.evaluate(animation.range, definition, instanceIndex);
		const animFrameRate = game.evaluate(animation.frameRate, definition, instanceIndex);

		const spriteAnim = this.animation;
		if (spriteAnim.frame !== animFrame || spriteAnim.start !== animStart || spriteAnim.range !== animRange || spriteAnim.frameRate !== animFrameRate) {
			spriteAnim.frame = animFrame;
			spriteAnim.start = animStart;
			spriteAnim.range = animRange;
			spriteAnim.frameRate = animFrameRate;
			updateTimes.animation = now;
		}
		const animCols = game.evaluate(grid[0], definition, instanceIndex);
		const animRows = game.evaluate(grid[1], definition, instanceIndex);
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