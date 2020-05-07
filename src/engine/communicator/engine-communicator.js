/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class EngineCommunicator {
	constructor() {
		this.setBuffer(new ArrayBuffer(1000000));
	}

	setBuffer(arrayBuffer) {
		this.count = 0;
		this.arrayBuffer = arrayBuffer;
		this.intBuffer = new Int32Array(this.arrayBuffer);
		this.floatBuffer = new Float32Array(this.arrayBuffer);
	}

	getBuffer() {
		return this.arrayBuffer;
	}

	loadToBuffer(command, params) {
		this.intBuffer[this.count++] = command;
		for (let i = 0; i < params.length; i++) {
			this.floatBuffer[this.count++] = params[i];
		}
	}
}
