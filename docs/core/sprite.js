/**
	Sprite
*/

class Sprite {
	constructor(providerIndex) {
		this.providerIndex = providerIndex;
		this.definitionIndex = -1;
		this.instanceIndex = -1;
		this.src = null;
		this.type = null;
		this.size = [0, 0];
		this.pos = [0, 0, 0];
		this.mov = [0, 0, 0];
		this.gravity = [0, 0, 0];
		this.animation = {
			frame: 0,
			range: 1,
			frameRate: 15,
		};
		this.grid = [1, 1];
		this.updateTimes = {};
		this.chunkIndex = -1;
	}
}