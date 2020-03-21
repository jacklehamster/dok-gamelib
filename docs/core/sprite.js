/**
	Sprite
*/

class Sprite extends AnimatedSprite {
	constructor() {
		super();
		this.scale = [0, 0];
		this.hotspot = [0, 0];
		this.pos = [0, 0, 0];
		this.mov = [0, 0, 0];
		this.corners = [0, 0, 0, 0];
		this.gravity = [0, 0, 0];
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { src, animation, scale, pos, mov, gravity, grid, hotspot, corners, refresh } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;

		const xScale = game.evaluate(scale[0], definition, instanceIndex);
		const yScale = game.evaluate(scale[1], definition, instanceIndex);

		if (this.scale[0] !== xScale || this.scale[1] !== yScale) {
			this.scale[0] = xScale;
			this.scale[1] = yScale;
			updateTimes.scale = now;
		}

		const hotspotX = game.evaluate(hotspot[0], definition, instanceIndex);
		const hotspotY = game.evaluate(hotspot[1], definition, instanceIndex);
		if (hotspotX !== this.hotspot[0] || hotspotY !== this.hotspot[1]) {
			this.hotspot[0] = hotspotX;
			this.hotspot[1] = hotspotY;
			updateTimes.hotspot = now;
		}

		const cornerA = game.evaluate(corners[0], definition, instanceIndex);
		const cornerB = game.evaluate(corners[1], definition, instanceIndex);
		const cornerC = game.evaluate(corners[2], definition, instanceIndex);
		const cornerD = game.evaluate(corners[3], definition, instanceIndex);
		if (!Utils.equal4(this.corners, cornerA, cornerB, cornerC, cornerD)) {
			Utils.set4(this.corners, cornerA, cornerB, cornerC, cornerD);
			updateTimes.corners = now;
		}

		const newPosX = game.evaluate(pos[0], definition, instanceIndex);
		const newPosY = game.evaluate(pos[1], definition, instanceIndex);
		const newPosZ = game.evaluate(pos[2], definition, instanceIndex);

		if (!Utils.equal3(this.pos, newPosX, newPosY, newPosZ)) {
			Utils.set3(this.pos, newPosX, newPosY, newPosZ);
			updateTimes.pos = now;
		}

		const newMovX = game.evaluate(mov[0], definition, instanceIndex);
		const newMovY = game.evaluate(mov[1], definition, instanceIndex);
		const newMovZ = game.evaluate(mov[2], definition, instanceIndex);

		if (!Utils.equal3(this.mov, newMovX, newMovY, newMovZ)) {
			Utils.set3(this.mov, newMovX, newMovY, newMovZ);
			updateTimes.mov = now;
		}

		const newGravityX = game.evaluate(gravity[0], definition, instanceIndex);
		const newGravityY = game.evaluate(gravity[1], definition, instanceIndex);
		const newGravityZ = game.evaluate(gravity[2], definition, instanceIndex);

		if (!Utils.equal3(this.gravity, newGravityX, newGravityY, newGravityZ)) {
			Utils.set3(this.gravity, newGravityX, newGravityY, newGravityZ);
			updateTimes.gravity = now;
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { scale, hotspot, pos, mov, gravity, hidden, corners, updateTimes } = this;
		if (updateTimes.pos === now) {
			chunk.setOffset(pos, now);
		}
		if (updateTimes.scale === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.hidden === now || updateTimes.corners === now) {
			if (hidden) {
				chunk.setHidden(now);
			} else {
				const spriteWidth = Math.abs(scale[0]);
				const spriteHeight = Math.abs(scale[1]);
				switch (this.type) {
					case SpriteType.Ceiling:
						chunk.setCeiling(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.Water:		
					case SpriteType.Floor:
						chunk.setFloor(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.LeftWall:
						chunk.setLeftWall(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.RightWall:
						chunk.setRightWall(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.Sprite:
					case SpriteType.Front:
						chunk.setWall(spriteWidth, spriteHeight, hotspot, corners, now);			
						break;
					case SpriteType.Back:
						chunk.setBackWall(spriteWidth, spriteHeight, hotspot, corners, now);
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
