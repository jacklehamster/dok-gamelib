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
		this.communicator.payload.clear();
	}

	sendPayload(now) {
		if (this.communicator.payload.hasData()) {
			this.payload.time = now;
			this.communicator.payload.retrievePayload(this.payload);
			this.worker.postMessage(this.payload, [this.payload.dataView.buffer]);
			this.communicator.payload.clear();
		} else {
			this.emptyPayload.time = now;
			this.worker.postMessage(this.emptyPayload);
		}
	}

	sendCommandInt(command, ...params) {
		this.communicator.payload.writeCommand(command);
		for (let i = 0; i < params.length; i++) {
			this.communicator.payload.writeInt(params[i]);
		}
	}

	sendCommand(command, floatParams, extras) {
		this.communicator.payload.writeCommand(command);
		if (floatParams) {
			for (let i = 0; i < floatParams.length; i++) {
				this.communicator.payload.writeFloat(floatParams[i]);
			}
		}
		if (extras) {
			for (let i = 0; i < extras.length; i++) {
				this.communicator.payload.writeExtra(extras[i]);
			}
		}
	}

	loadToBuffer(command, params) {
		this.communicator.payload.writeCommand(command);
		if (params) {
			for (let i = 0; i < params.length; i++) {
				this.communicator.payload.writeFloat(params[i]);
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

		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Uint8Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeCommand(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.communicator.payload.writeInt(offset);
		this.communicator.payload.writeInt(params.length * Uint8Array.BYTES_PER_ELEMENT);


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

		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Uint16Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeCommand(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.communicator.payload.writeInt(offset);
		this.communicator.payload.writeInt(params.length * Uint16Array.BYTES_PER_ELEMENT);

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

		// this.lastGLBuffer.type = type;
		// this.lastGLBuffer.offset = offset;
		// this.lastGLBuffer.size = params.length * Float32Array.BYTES_PER_ELEMENT;
		this.communicator.payload.writeCommand(Commands.GL_UPDATE_BUFFER);
		this.communicator.payload.writeUnsignedByte(type);
		this.communicator.payload.writeInt(offset);
		this.communicator.payload.writeInt(params.length * Float32Array.BYTES_PER_ELEMENT);
		// this.lastGLBuffer.bufferStartIndex = this.byteCount;
		for (let i = 0; i < params.length; i++) {
			this.communicator.payload.writeFloat(params[i]);
		}
	}
}
