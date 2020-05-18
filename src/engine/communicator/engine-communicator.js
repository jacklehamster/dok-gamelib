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
		this.pool = new Pool(() => new ArrayBuffer(MAX_BUFFER_SIZE));
		this.lastError = null;
		this.maxSize = 0;
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
		if (this.count > this.maxSize) {
			this.maxSize = this.count;
			const percentUsed = (100 * (this.maxSize * Float32Array.BYTES_PER_ELEMENT) / MAX_BUFFER_SIZE);
			if (percentUsed < 80) {
				console.log(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else if (percentUsed < 100) {
				console.warn(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else {
				console.error(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			}
		}

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

	sendInt(...params) {
		this.ensureBuffer();
		for (let i = 0; i < params.length; i++) {
			this.intBuffer[this.count + i] = params[i];		
		}
		this.count += params.length;
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

	loadGLBuffer(type, offset, ...params) {
		this.ensureBuffer();

		this.intBuffer[this.count++] = Commands.GL_UPDATE_BUFFER;
		this.intBuffer[this.count++] = type;
		this.intBuffer[this.count++] = offset;
		this.intBuffer[this.count++] = params.length;
		for (let i = 0; i < params.length; i++) {
			this.floatBuffer[this.count + i] = params[i];
		}
		this.count += params.length;
	}
}
