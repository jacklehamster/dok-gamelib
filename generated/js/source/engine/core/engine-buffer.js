/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
 * EngineBuffer
 */

class EngineBuffer {
 	constructor(shader, type, name, floatPerVertex, bufferType, normalized, stride, offset, usage, buffer) {
 		this.type = type;
 		this.floatPerVertex = floatPerVertex;
 		this.shaderBuffer = this.initializeVertexBuffer(shader, name, bufferType, normalized, stride, offset, usage, buffer);
 	}

 	static getByteSize(gl, bufferType) {
 		switch(bufferType) {
 			case gl.BYTE:
				return Int8Array.BYTES_PER_ELEMENT;
 			case gl.UNSIGNED_BYTE:
				return Uint8Array.BYTES_PER_ELEMENT;
			case gl.SHORT:
				return Int16Array.BYTES_PER_ELEMENT;
			case gl.UNSIGNED_SHORT:
				return Uint16Array.BYTES_PER_ELEMENT;
			case gl.INT:
				return Int32Array.BYTES_PER_ELEMENT;
			case gl.UNSIGNED_INT:
				return Uint32Array.BYTES_PER_ELEMENT;
			case gl.FLOAT:
				return Float32Array.BYTES_PER_ELEMENT;
 		}
 	}


// BYTE	0x1400	 
// UNSIGNED_BYTE	0x1401	 
// SHORT	0x1402	 
// UNSIGNED_SHORT	0x1403	 
// INT	0x1404	 
// UNSIGNED_INT	0x1405	 
// FLOAT


	initializeVertexBuffer(shader, name, bufferType, normalized, stride, offset, usage, buffer) {
		const gl = shader.gl;
		const byteSize = EngineBuffer.getByteSize(gl, bufferType);
		const vertexBuffer = buffer || gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		const location = shader.getLocation(name);
		gl.vertexAttribPointer(location, this.floatPerVertex, bufferType || gl.FLOAT, normalized||false, stride||0, offset||0);
		gl.enableVertexAttribArray(location);
		gl.bufferData(gl.ARRAY_BUFFER, (stride ? stride : this.floatPerVertex * VERTICES_PER_SPRITE ) * MAX_SPRITE * byteSize, usage || gl.STREAM_DRAW);
		return vertexBuffer;
	}
}