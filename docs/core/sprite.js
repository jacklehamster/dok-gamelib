/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	Sprite
*/

class SpriteInstance extends AnimatedSpriteInstance {
	constructor() {
		super();
		this.scale = 	[0, 0];
		this.hotspot = 	[0, 0];
		this.pos = 		[0, 0, 0];
		this.mov = 		[0, 0, 0];
		this.corners = 	[0, 0, 0, 0];
		this.gravity = 	[0, 0, 0];
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { src, animation, scale, pos, mov, gravity, hotspot, corners, refresh } = definition;
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
}
