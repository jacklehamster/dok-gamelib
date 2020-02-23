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
		this.pos = new Float32Array(3);
		this.mov = new Float32Array(3);
		this.gravity = new Float32Array(3);
		this.animation = {
			frame: 0,
			range: 1,
			frameRate: 15,
			grid: [1, 1],
		};
		this.updateTime = 0;
		this.chunkIndex = -1;
	}
}