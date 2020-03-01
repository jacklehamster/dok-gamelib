/**
	Sprite
*/

class Sprite extends AnimatedSprite {
	constructor() {
		super();
		this.size = [0, 0];
		this.pos = [0, 0, 0];
		this.mov = [0, 0, 0];
		this.gravity = [0, 0, 0];
	}

	getEvaluated(evaluator, definition) {
		super.getEvaluated(evaluator, definition);
		const { src, animation, size, pos, mov, gravity, grid } = definition;
		const { instanceIndex, updateTimes } = this;
		const { timeMillis } = evaluator;

		const spriteWidth = !src ? 0 : size ? evaluator.evaluate(size[0], this, instanceIndex) : 1;
		const spriteHeight = !src ? 0 : size ? evaluator.evaluate(size[1], this, instanceIndex) : 1;

		if (this.size[0] !== spriteWidth || this.size[1] !== spriteHeight) {
			this.size[0] = spriteWidth;
			this.size[1] = spriteHeight;
			updateTimes.size = timeMillis;
		}

		for (let i = 0; i < 3; i++) {
			if (pos) {
				const value = evaluator.evaluate(pos[i], this, instanceIndex);
				if (value !== this.pos[i]) {
					this.pos[i] = value;
					updateTimes.pos = timeMillis;
				}
			}
			if (mov) {
				const value = evaluator.evaluate(mov[i], this, instanceIndex);
				if (value !== this.mov[i]) {
					this.mov[i] = value;
					updateTimes.mov = timeMillis;
				}
			}
			if (gravity) {
				const value = evaluator.evaluate(gravity[i], this, instanceIndex);
				if (value !== this.gravity[i]) {
					this.gravity[i] = value;
					updateTimes.gravity = timeMillis;
				}
			}
		}	
	}

	updateChunk(engine, chunk, timeMillis) {
		super.updateChunk(engine, chunk, timeMillis);
		const { size, pos, mov, gravity, updateTimes } = this;
		if (updateTimes.pos === timeMillis || updateTimes.size !== timeMillis) {
			const [ x, y, z ] = pos;
			const [ width, height ] = size;
			chunk.setWall(x, y, z, width, height, timeMillis);
		}
		if (updateTimes.mov === timeMillis) {
			const [ mx, my, mz ] = mov;
			chunk.setMove(mx, my, mz, timeMillis);
		}
		if (updateTimes.gravity === timeMillis) {
			const [ gx, gy, gz ] = gravity;
			chunk.setGravity(gx, gy, gz, timeMillis);
		}
	}
}
