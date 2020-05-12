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
		this.lastGLBuffer = {
			bufferIndex: -1,
			nextIndex: -1,
			type: null,
			offset: null,
			size: 0,
		};
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

			this.lastGLBuffer.bufferIndex = -1;
			this.lastGLBuffer.nextIndex = -1;
			this.lastGLBuffer.type = null;
			this.lastGLBuffer.offset = null;
			this.lastGLBuffer.size = 0;
		}
	}

	clear() {
		if (this.count > this.maxSize) {
			this.maxSize = this.count;
			if (this.floatBuffer.length) {
				console.log("Data buffer used:", (100 * this.maxSize / this.floatBuffer.length).toFixed(2) + "%");
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
		const { lastGLBuffer } = this;
		//	check if it's a continuation of previous buffer
		if (lastGLBuffer.nextIndex === this.count
			&& type === lastGLBuffer.type
			&& offset === lastGLBuffer.offset + lastGLBuffer.size) {

			for (let i = 0; i < params.length; i++) {
				this.floatBuffer[this.count + i] = params[i];
			}
			this.count += params.length;

			lastGLBuffer.size = this.intBuffer[lastGLBuffer.bufferIndex + 3] = this.intBuffer[lastGLBuffer.bufferIndex + 3] + params.length;
			lastGLBuffer.nextIndex = lastGLBuffer.bufferIndex + 4 + lastGLBuffer.size;
			return;
		}

		this.ensureBuffer();

		lastGLBuffer.bufferIndex = this.count;
		lastGLBuffer.type = type;
		lastGLBuffer.offset = offset;
		lastGLBuffer.size = params.length;
		lastGLBuffer.nextIndex = lastGLBuffer.bufferIndex + 4 + params.length;

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
