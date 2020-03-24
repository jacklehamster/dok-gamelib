/**
	Sprite
*/

class SpriteInstance extends AnimatedSpriteInstance {
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

		const xScale = scale[0].get(instanceIndex);
		const yScale = scale[1].get(instanceIndex);

		if (this.scale[0] !== xScale || this.scale[1] !== yScale) {
			this.scale[0] = xScale;
			this.scale[1] = yScale;
			updateTimes.scale = now;
		}

		const hotspotX = hotspot[0].get(instanceIndex);
		const hotspotY = hotspot[1].get(instanceIndex);
		if (hotspotX !== this.hotspot[0] || hotspotY !== this.hotspot[1]) {
			this.hotspot[0] = hotspotX;
			this.hotspot[1] = hotspotY;
			updateTimes.hotspot = now;
		}

		const cornerA = corners[0].get(instanceIndex);
		const cornerB = corners[1].get(instanceIndex);
		const cornerC = corners[2].get(instanceIndex);
		const cornerD = corners[3].get(instanceIndex);
		if (!Utils.equal4(this.corners, cornerA, cornerB, cornerC, cornerD)) {
			Utils.set4(this.corners, cornerA, cornerB, cornerC, cornerD);
			updateTimes.corners = now;
		}

		const newPosX = pos[0].get(instanceIndex);
		const newPosY = pos[1].get(instanceIndex);
		const newPosZ = pos[2].get(instanceIndex);

		if (!Utils.equal3(this.pos, newPosX, newPosY, newPosZ)) {
			Utils.set3(this.pos, newPosX, newPosY, newPosZ);
			updateTimes.pos = now;
		}

		const newMovX = mov[0].get(instanceIndex);
		const newMovY = mov[1].get(instanceIndex);
		const newMovZ = mov[2].get(instanceIndex);

		if (!Utils.equal3(this.mov, newMovX, newMovY, newMovZ)) {
			Utils.set3(this.mov, newMovX, newMovY, newMovZ);
			updateTimes.mov = now;
		}

		const newGravityX = gravity[0].get(instanceIndex);
		const newGravityY = gravity[1].get(instanceIndex);
		const newGravityZ = gravity[2].get(instanceIndex);

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
