/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class EngineCommunicator {
	constructor(worker, communicator) {
		this.worker = worker;
		this.communicator = communicator;
		this.lastError = null;
		this.maxSize = 0;
		// this.lastGLBuffer = {
		// 	type: null,
		// 	offset: 0,
		// 	size: 0,
		// 	bufferStartIndex: 0,
		// };
		this.payload = {
			action: "payload",
			time: 0,
		};
		this.emptyPayload = {
			action: "payload",
			time: 0,
		};

		this.clear();
	}

	sendPayload(now) {
		if (this.communicator.payload.hasData()) {
			this.payload.time = now;
			this.communicator.payload.retrievePayload(this.payload);
			this.worker.postMessage(this.payload, [this.payload.dataView.buffer]);
			this.clear();
		} else {
			this.emptyPayload.time = now;
			this.worker.postMessage(this.emptyPayload);
		}

	}

	restoreDataView(dataView) {
		this.communicator.payload.dataViewPool.recycle(dataView);
	}

	ensureBuffer() {
		this.communicator.payload.ensure();
	}

	clear() {
		this.communicator.payload.clear();
	}

	writeShort(...values) {
		for (let i = 0; i < values.length; i++) {
			if (values[i] > 0xFFFF) {
				console.error("Int16 out of bound: ", values[i]);
			}
			this.communicator.payload.writeUnsignedShort(values[i]);
		}		
	}

	writeInt32(...values) {
		for (let i = 0; i < values.length; i++) {
			this.communicator.payload.writeInt(values[i]);
		}
	}

	writeFloat32(...values) {
		for (let i = 0; i < values.length; i++) {
			this.communicator.payload.writeFloat(values[i]);
		}		
	}

	sendCommandInt(command, ...params) {
		this.ensureBuffer();
		this.communicator.payload.writeUnsignedByte(command);
		this.writeInt32(...params);		
	}

	sendCommand(command, floatParams, extras) {
		this.loadToBuffer(command, floatParams);
		this.loadExtra(extras);
	}

	loadToBuffer(command, params) {
		this.ensureBuffer();
		this.communicator.payload.writeUnsignedByte(command);
		if (params) {
			this.writeFloat32(...params);
		}
	}

	loadExtra(params) {
		if (params) {
			for (let i = 0; i < params.length; i++) {
				this.communicator.payload.writeExtra(params[i]);
			}
		}
	}

	loadGLBufferByte(type, offset, ...params) {
		// if (this.lastGLBuffer.type === type
		// 	&& offset === this.lastGLBuffer.offset + this.lastGLBuffer.size
		// 	&& this.byteCount === this.lastGLBuffer.bufferStartIndex + this.lastGLBuffer.size
		// ) {	//	append to previous buffer
		// 	this.writeUnsignedByte(...params);
		// 	this.lastGLBuffer.size += params.length * Uint8Array.BYTES_PER_ELEMENT;
		// 	this.dataView.setInt32(
		// 		this.lastGLBuffer.bufferStartIndex - Int32Array.BYTES_PER_ELEMENT,
		// 		this.lastGLBuffer.size,
		// 		true
		// 	);
		// 	return;
		// }

		this.ensureBuffer();
		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Uint8Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeUnsignedByte(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.writeInt32(offset, params.length * Uint8Array.BYTES_PER_ELEMENT);
		// this.lastGLBuffer.bufferStartIndex = this.byteCount;
		for (let i = 0; i < params.length; i++) {
			this.communicator.payload.writeUnsignedByte(params[i]);
		}
	}

	loadGLBufferShort(type, offset, ...params) {
		// if (this.lastGLBuffer.type === type
		// 	&& offset === this.lastGLBuffer.offset + this.lastGLBuffer.size
		// 	&& this.byteCount === this.lastGLBuffer.bufferStartIndex + this.lastGLBuffer.size
		// ) {	//	append to previous buffer
		// 	this.writeShort(...params);
		// 	this.lastGLBuffer.size += params.length * Uint16Array.BYTES_PER_ELEMENT;
		// 	this.dataView.setInt32(
		// 		this.lastGLBuffer.bufferStartIndex - Int32Array.BYTES_PER_ELEMENT,
		// 		this.lastGLBuffer.size,
		// 		true
		// 	);
		// 	return;
		// }

		this.ensureBuffer();
		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Uint16Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeUnsignedByte(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.writeInt32(offset, params.length * Uint16Array.BYTES_PER_ELEMENT);

		for (let i = 0; i < params.length; i++) {
			if (params[i] > 0xFFFF) {
				console.error("Int16 out of bound: ", params[i]);
			}
			this.communicator.payload.writeUnsignedShort(params[i]);
		}
	}

	loadGLBuffer(type, offset, ...params) {
		// if (this.lastGLBuffer.type === type
		// 	&& offset === this.lastGLBuffer.offset + this.lastGLBuffer.size
		// 	&& this.byteCount === this.lastGLBuffer.bufferStartIndex + this.lastGLBuffer.size
		// ) {	//	append to previous buffer
		// 	this.writeFloat32(...params);
		// 	this.lastGLBuffer.size += params.length * Float32Array.BYTES_PER_ELEMENT;
		// 	this.dataView.setInt32(
		// 		this.lastGLBuffer.bufferStartIndex - Int32Array.BYTES_PER_ELEMENT,
		// 		this.lastGLBuffer.size,
		// 		true
		// 	);
		// 	return;
		// }

		this.ensureBuffer();
		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Float32Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeUnsignedByte(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.writeInt32(offset, params.length * Float32Array.BYTES_PER_ELEMENT);
		// this.lastGLBuffer.bufferStartIndex = this.byteCount;
		this.writeFloat32(...params);
	}
}
