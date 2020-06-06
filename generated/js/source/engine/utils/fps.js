/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class FPSTracker {
	constructor(capacity) {
		this.accumulator = new Array(capacity || 100).fill(0);
		this.index = 0;
	}

	tick() {
		const time = Date.now();
		this.accumulator[this.index] = time;
		this.index = ((this.index+1) % this.accumulator.length);
		const timeDiff = time - this.accumulator[this.index];
		return 1000 / (timeDiff / this.accumulator.length);
	}

	get frameRate() {
		const { accumulator, index } = this;
		const timeDiff =  accumulator[(index-1 + accumulator.length) % accumulator.length] - accumulator[index];
		return 1000 / (timeDiff / accumulator.length);
	}
}

FPSTracker.fps = new FPSTracker();