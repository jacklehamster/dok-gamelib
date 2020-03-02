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

		if (pos) {
			const newPosX = evaluator.evaluate(pos[0], this, instanceIndex);
			const newPosY = evaluator.evaluate(pos[1], this, instanceIndex);
			const newPosZ = evaluator.evaluate(pos[2], this, instanceIndex);

			if (!Utils.equal3(this.pos, newPosX, newPosY, newPosZ)) {
				Utils.set3(this.pos, newPosX, newPosY, newPosZ);
				updateTimes.pos = timeMillis;
			}
		}

		if (mov) {
			const newMovX = evaluator.evaluate(mov[0], this, instanceIndex);
			const newMovY = evaluator.evaluate(mov[1], this, instanceIndex);
			const newMovZ = evaluator.evaluate(mov[2], this, instanceIndex);

			if (!Utils.equal3(this.mov, newMovX, newMovY, newMovZ)) {
				Utils.set3(this.mov, newMovX, newMovY, newMovZ);
				updateTimes.mov = timeMillis;
			}
		}

		if (gravity) {
			const newGravityX = evaluator.evaluate(gravity[0], this, instanceIndex);
			const newGravityY = evaluator.evaluate(gravity[1], this, instanceIndex);
			const newGravityZ = evaluator.evaluate(gravity[2], this, instanceIndex);

			if (!Utils.equal3(this.gravity, newGravityX, newGravityY, newGravityZ)) {
				Utils.set3(this.gravity, newGravityX, newGravityY, newGravityZ);
				updateTimes.gravity = timeMillis;
			}
		}
	}

	updateChunk(engine, chunk, timeMillis) {
		super.updateChunk(engine, chunk, timeMillis);
		const { size, pos, mov, gravity, updateTimes } = this;
		if (updateTimes.pos === timeMillis) {
			const [ x, y, z ] = pos;
			chunk.setOffset(x, y, z, timeMillis);
		}
		if (updateTimes.size === timeMillis || updateTimes.type === timeMillis) {
			const [ width, height ] = size;
			switch (this.type) {
				case SpriteType.Ceiling:
					chunk.setCeiling(width, height, timeMillis);
					break;					
				case SpriteType.Floor:
					chunk.setFloor(width, height, timeMillis);
					break;
				case SpriteType.LeftWall:
					chunk.setLeftWall(width, height, timeMillis);
					break;
				case SpriteType.RightWall:
					chunk.setRightWall(width, height, timeMillis);
					break;
				case SpriteType.Default:
				case SpriteType.Sprite:
					chunk.setWall(width, height, timeMillis);			
					break;
				default:
					console.error("invalid type");
			}
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
