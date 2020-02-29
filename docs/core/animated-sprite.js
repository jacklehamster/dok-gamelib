/**
  *		AnimatedSprite
  */

class AnimatedSprite extends ImageSprite {
	constructor() {
		super();
		this.animation = {
			frame: 0,
			range: 1,
			frameRate: 15,
		};
		this.grid = [1, 1];
	}

	getEvaluated(evaluator, definition) {
		super.getEvaluated(evaluator, definition);
		const { src, animation, grid } = definition;
		const { instanceIndex, updateTimes } = this;
		const { timeMillis } = evaluator;

		if (animation) {
			const { frame, range, frameRate } = animation;
			const animFrame = evaluator.evaluate(frame, this, instanceIndex) || 0;
			const animRange = evaluator.evaluate(range, this, instanceIndex) || 1;
			const animFrameRate = evaluator.evaluate(frameRate, this, instanceIndex) || 15;

			const spriteAnim = this.animation;
			if (spriteAnim.frame !== animFrame || spriteAnim.range !== animRange || spriteAnim.frameRate !== animFrameRate) {
				spriteAnim.frame = animFrame;
				spriteAnim.range = animRange;
				spriteAnim.frameRate = animFrameRate;
				updateTimes.animation = timeMillis;
			}
		}
		if (grid) {
			const animCols = evaluator.evaluate(grid[0], this, instanceIndex) || 1;
			const animRows = evaluator.evaluate(grid[1], this, instanceIndex) || 1;
			if (this.grid[0] !== animCols || this.grid[1] !== animRows) {
				this.grid[0] = animCols;
				this.grid[1] = animRows;
				updateTimes.grid = timeMillis;
			}
		}	
	}

	updateChunk(engine, chunk, timeMillis) {
		const { src, animation, grid, size, updateTimes } = this;
		if (updateTimes.grid === timeMillis || updateTimes.src === timeMillis) {
			if (!src) {
				chunk.setTexture(0, 0, 0, 0);
			} else {
				const { offset, size, index } = engine.imagedata.sprites[src];
				const [ sheetWidth, sheetHeight ] = size;
				const [ cols, rows ] = grid;
				chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows, timeMillis);
			}
		}
		if (updateTimes.grid === timeMillis || updateTimes.animation === timeMillis) {
			const { frame, range, frameRate } = animation;
			const [ cols, rows ] = grid;
			chunk.setAnimation(cols, frame, range, frameRate, timeMillis);
		}
	}	
}