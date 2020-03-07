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

		const animFrame = game.evaluate(animation.frame, this, instanceIndex);
		const animStart = game.evaluate(animation.start, this, instanceIndex);
		const animRange = game.evaluate(animation.range, this, instanceIndex);
		const animFrameRate = game.evaluate(animation.frameRate, this, instanceIndex);

		const spriteAnim = this.animation;
		if (spriteAnim.frame !== animFrame || spriteAnim.start !== animStart || spriteAnim.range !== animRange || spriteAnim.frameRate !== animFrameRate) {
			spriteAnim.frame = animFrame;
			spriteAnim.start = animStart;
			spriteAnim.range = animRange;
			spriteAnim.frameRate = animFrameRate;
			updateTimes.animation = now;
		}
		const animCols = game.evaluate(grid[0], this, instanceIndex);
		const animRows = game.evaluate(grid[1], this, instanceIndex);
		if (this.grid[0] !== animCols || this.grid[1] !== animRows) {
			this.grid[0] = animCols;
			this.grid[1] = animRows;
			updateTimes.grid = now;
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { src, animation, grid, size, updateTimes } = this;
		if (updateTimes.grid === now) {
			const [ cols, rows ] = grid;
			chunk.setGrid(cols, rows, now);
		}
		if (updateTimes.src === now) {
			if (!src) {
				chunk.setTexture(0, 0, 0, 0);
			} else {
				const { offset, size, index } = engine.imagedata.sprites[src];
				const [ sheetWidth, sheetHeight ] = size;
				const [ cols, rows ] = grid;
				chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows, now);
			}
		}
		if (updateTimes.grid === now || updateTimes.animation === now) {
			const { frame, start, range, frameRate } = animation;
			const [ cols, rows ] = grid;
			chunk.setAnimation(frame, start, range, frameRate, now);
		}
	}	
}