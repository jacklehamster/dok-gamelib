/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class EngineCommunicator {
	constructor() {
		this.count = 0;
		this.arrayBuffer = null;
		this.intBuffer = null;
		this.floatBuffer = null;
		this.extraData = [];
		this.pool = new Pool(() => new ArrayBuffer(1000000));
		this.clear();
	}

	restoreBuffer(arrayBuffer) {
		this.pool.recycle(arrayBuffer);
	}

	ensureBuffer() {
		if (!this.arrayBuffer || this.arrayBuffer.byteLength === 0) {
			this.arrayBuffer = this.pool.get();
			this.intBuffer = new Int32Array(this.arrayBuffer);
			this.floatBuffer = new Float32Array(this.arrayBuffer);
			this.count = 0;
		}
	}

	clear() {
		this.count = 0;
		this.extraData.length = 0;
	}

	getBuffer() {
		return this.arrayBuffer;
	}

	getCount() {
		return this.count;
	}

	getExtra() {
		return this.extraData;
	}

	sendCommand(command, floatParams, extras) {
		this.loadToBuffer(command, floatParams);
		this.loadExtra(extras);
	}

	loadToBuffer(command, params) {
		this.ensureBuffer();
		this.intBuffer[this.count++] = command;
		if (params) {
			for (let i = 0; i < params.length; i++) {
				this.floatBuffer[this.count++] = params[i];
			}
		}
	}

	loadExtra(params) {
		if (params) {
			for (let i = 0; i < params.length; i++) {
				this.extraData.push(params[i]);
			}
		}
	}
}
