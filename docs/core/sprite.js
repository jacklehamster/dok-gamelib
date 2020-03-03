/**
	Sprite
*/

class Sprite extends AnimatedSprite {
	constructor() {
		super();
		this.size = [0, 0];
		this.hotspot = [0, 0];
		this.pos = [0, 0, 0];
		this.mov = [0, 0, 0];
		this.gravity = [0, 0, 0];
	}

	getEvaluated(evaluator, definition) {
		super.getEvaluated(evaluator, definition);
		const { src, animation, size, pos, mov, gravity, grid, hotspot } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = evaluator;

		const spriteWidth = !src ? 0 : size ? evaluator.evaluate(size[0], this, instanceIndex) : 1;
		const spriteHeight = !src ? 0 : size ? evaluator.evaluate(size[1], this, instanceIndex) : 1;

		if (this.size[0] !== spriteWidth || this.size[1] !== spriteHeight) {
			this.size[0] = spriteWidth;
			this.size[1] = spriteHeight;
			updateTimes.size = now;
		}

		const hotspotX = !hotspot ? 0 : evaluator.evaluate(hotspot[0], this, instanceIndex);
		const hotspotY = !hotspot ? 0 : evaluator.evaluate(hotspot[1], this, instanceIndex);
		if (hotspotX !== this.hotspot[0] || hotspotY !== this.hotspot[1]) {
			this.hotspot[0] = hotspotX;
			this.hotspot[1] = hotspotY;
			updateTimes.hotspot = now;
		}

		const newPosX = !pos ? 0 : evaluator.evaluate(pos[0], this, instanceIndex);
		const newPosY = !pos ? 0 : evaluator.evaluate(pos[1], this, instanceIndex);
		const newPosZ = !pos ? 0 : evaluator.evaluate(pos[2], this, instanceIndex);

		if (!Utils.equal3(this.pos, newPosX, newPosY, newPosZ)) {
			Utils.set3(this.pos, newPosX, newPosY, newPosZ);
			updateTimes.pos = now;
		}

		if (mov) {
			const newMovX = evaluator.evaluate(mov[0], this, instanceIndex);
			const newMovY = evaluator.evaluate(mov[1], this, instanceIndex);
			const newMovZ = evaluator.evaluate(mov[2], this, instanceIndex);

			if (!Utils.equal3(this.mov, newMovX, newMovY, newMovZ)) {
				Utils.set3(this.mov, newMovX, newMovY, newMovZ);
				updateTimes.mov = now;
			}
		}

		if (gravity) {
			const newGravityX = evaluator.evaluate(gravity[0], this, instanceIndex);
			const newGravityY = evaluator.evaluate(gravity[1], this, instanceIndex);
			const newGravityZ = evaluator.evaluate(gravity[2], this, instanceIndex);

			if (!Utils.equal3(this.gravity, newGravityX, newGravityY, newGravityZ)) {
				Utils.set3(this.gravity, newGravityX, newGravityY, newGravityZ);
				updateTimes.gravity = now;
			}
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { size, hotspot, pos, mov, gravity, updateTimes } = this;
		if (updateTimes.pos === now) {
			const [ x, y, z ] = pos;
			chunk.setOffset(x, y, z, now);
		}
		if (updateTimes.size === now || updateTimes.type === now || updateTimes.hotspot === now) {
			const [ width, height ] = size;
			const [ hotX, hotY ] = hotspot;
			switch (this.type) {
				case SpriteType.Ceiling:
					chunk.setCeiling(size, hotspot, now);
					break;
				case SpriteType.Water:		
				case SpriteType.Floor:
					chunk.setFloor(size, hotspot, now);
					break;
				case SpriteType.LeftWall:
					chunk.setLeftWall(size, hotspot, now);
					break;
				case SpriteType.RightWall:
					chunk.setRightWall(size, hotspot, now);
					break;
				case SpriteType.Default:
				case SpriteType.Sprite:
					chunk.setWall(size, hotspot, now);			
					break;
				default:
					console.error("invalid type");
			}
		}
		if (updateTimes.mov === now) {
			const [ mx, my, mz ] = mov;
			chunk.setMove(mx, my, mz, now);
		}
		if (updateTimes.gravity === now) {
			const [ gx, gy, gz ] = gravity;
			chunk.setGravity(gx, gy, gz, now);
		}
	}
}
