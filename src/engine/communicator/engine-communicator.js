/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class EngineCommunicator {
	constructor() {
		this.byteCount = 0;
		this.arrayBuffer = null;
		this.extraData = [];
		this.pool = new Pool(() => new ArrayBuffer(MAX_BUFFER_SIZE));
		this.lastError = null;
		this.maxSize = 0;
		this.lastGLBuffer = {
			type: null,
			offset: 0,
			size: 0,
			bufferStartIndex: 0,
		};
		this.clear();

		console.log("TODO", "restore lastGLBuffer info (To batch buffers into one)");
	}

	restoreBuffer(arrayBuffer) {
		this.pool.recycle(arrayBuffer);
	}

	ensureBuffer() {
		if (!this.arrayBuffer || this.arrayBuffer.byteLength === 0) {
			this.arrayBuffer = this.pool.get();
			this.dataView = new DataView(this.arrayBuffer);
			this.byteCount = 0;
			this.lastGLBuffer.type = null;
		}
	}

	clear() {
		if (this.byteCount > this.maxSize) {
			this.maxSize = this.byteCount;
			const percentUsed = (100 * this.maxSize / MAX_BUFFER_SIZE);
			if (percentUsed < 80) {
				console.log(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else if (percentUsed < 100) {
				console.warn(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else {
				console.error(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			}
		}

		this.byteCount = 0;
		this.extraData.length = 0;
		this.lastGLBuffer.type = null;
	}

	getBuffer() {
		return this.arrayBuffer;
	}

	getByteCount() {
		return this.byteCount;
	}

	getExtra() {
		return this.extraData;
	}

	writeUnsignedByte(...values) {
		for (let i = 0; i < values.length; i++) {
			if (values[i] >= 256) {
				console.error("Byte out of bound: ", values[i]);
			}
			this.dataView.setUint8(this.byteCount, values[i]);
			this.byteCount += Uint8Array.BYTES_PER_ELEMENT;
		}		
	}

	writeInt32(...values) {
		for (let i = 0; i < values.length; i++) {
			this.dataView.setInt32(this.byteCount, values[i], true);
			this.byteCount += Int32Array.BYTES_PER_ELEMENT;
		}
	}

	writeFloat32(...values) {
		for (let i = 0; i < values.length; i++) {
			this.dataView.setFloat32(this.byteCount, values[i], true);
			this.byteCount += Float32Array.BYTES_PER_ELEMENT;
		}		
	}

	sendCommandThenInt(command, ...params) {
		this.ensureBuffer();
		this.writeUnsignedByte(command);
		this.writeInt32(...params);		
	}

	sendCommand(command, floatParams, extras) {
		this.loadToBuffer(command, floatParams);
		this.loadExtra(extras);
	}

	loadToBuffer(command, params) {
		this.ensureBuffer();
		this.writeUnsignedByte(command);
		if (params) {
			this.writeFloat32(...params);
		}
	}

	loadExtra(params) {
		if (params) {
			this.extraData.push(...params);
		}
	}

	loadGLBuffer(type, offset, ...params) {
		if (this.lastGLBuffer.type === type
			&& offset === this.lastGLBuffer.offset + this.lastGLBuffer.size
			&& this.byteCount === this.lastGLBuffer.bufferStartIndex + this.lastGLBuffer.size
		) {	//	append to previous buffer
			this.writeFloat32(...params);
			this.lastGLBuffer.size += params.length * Float32Array.BYTES_PER_ELEMENT;
			this.dataView.setInt32(
				this.lastGLBuffer.bufferStartIndex - Int32Array.BYTES_PER_ELEMENT,
				this.lastGLBuffer.size,
				true
			);
			return;
		}


		this.ensureBuffer();
		this.lastGLBuffer.type = type;
		this.lastGLBuffer.offset = offset;
		this.lastGLBuffer.size = params.length * Float32Array.BYTES_PER_ELEMENT;
		this.writeUnsignedByte(Commands.GL_UPDATE_BUFFER);
		this.writeInt32(type, offset, this.lastGLBuffer.size);
		this.lastGLBuffer.bufferStartIndex = this.byteCount;
		this.writeFloat32(...params);
	}
}
