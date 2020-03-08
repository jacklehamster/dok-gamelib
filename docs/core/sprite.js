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

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		const { src, animation, size, pos, mov, gravity, grid, hotspot, refresh } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;

		const spriteWidth = game.evaluate(size[0], definition, instanceIndex);
		const spriteHeight = game.evaluate(size[1], definition, instanceIndex);

		if (this.size[0] !== spriteWidth || this.size[1] !== spriteHeight) {
			this.size[0] = spriteWidth;
			this.size[1] = spriteHeight;
			updateTimes.size = now;
		}

		const hotspotX = game.evaluate(hotspot[0], definition, instanceIndex);
		const hotspotY = game.evaluate(hotspot[1], definition, instanceIndex);
		if (hotspotX !== this.hotspot[0] || hotspotY !== this.hotspot[1]) {
			this.hotspot[0] = hotspotX;
			this.hotspot[1] = hotspotY;
			updateTimes.hotspot = now;
		}

		const newPosX = game.evaluate(pos[0], definition, instanceIndex);
		const newPosY = game.evaluate(pos[1], definition, instanceIndex);
		const newPosZ = game.evaluate(pos[2], definition, instanceIndex);

		if (!Utils.equal3(this.pos, newPosX, newPosY, newPosZ)) {
			Utils.set3(this.pos, newPosX, newPosY, newPosZ);
			updateTimes.pos = now;
		}

		if (mov) {
			const newMovX = game.evaluate(mov[0], definition, instanceIndex);
			const newMovY = game.evaluate(mov[1], definition, instanceIndex);
			const newMovZ = game.evaluate(mov[2], definition, instanceIndex);

			if (!Utils.equal3(this.mov, newMovX, newMovY, newMovZ)) {
				Utils.set3(this.mov, newMovX, newMovY, newMovZ);
				updateTimes.mov = now;
			}
		}

		if (gravity) {
			const newGravityX = game.evaluate(gravity[0], definition, instanceIndex);
			const newGravityY = game.evaluate(gravity[1], definition, instanceIndex);
			const newGravityZ = game.evaluate(gravity[2], definition, instanceIndex);

			if (!Utils.equal3(this.gravity, newGravityX, newGravityY, newGravityZ)) {
				Utils.set3(this.gravity, newGravityX, newGravityY, newGravityZ);
				updateTimes.gravity = now;
			}
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { size, hotspot, pos, mov, gravity, hidden, updateTimes } = this;
		if (updateTimes.pos === now) {
			const [ x, y, z ] = pos;
			chunk.setOffset(x, y, z, now);
		}
		if (updateTimes.size === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.hidden === now) {
			if (hidden) {
				chunk.setHidden(now);
			} else {
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
					case SpriteType.Sprite:
					case SpriteType.Front:
						chunk.setWall(size, hotspot, now);			
						break;
					case SpriteType.Back:
						chunk.setBackWall(size, hotspot, now);
						break;
					default:
						console.error("invalid type");
				}
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
