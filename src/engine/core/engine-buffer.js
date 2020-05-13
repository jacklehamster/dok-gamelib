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
 	constructor(shader, type, name, floatPerVertex, bufferType, normalized, stride, offset, buffer) {
 		this.type = type;
 		this.floatPerVertex = floatPerVertex;
 		this.shaderBuffer = this.initializeVertexBuffer(shader, name, bufferType, normalized, stride, offset, buffer);
 	}

	initializeVertexBuffer(shader, name, bufferType, normalized, stride, offset, buffer) {
		const gl = shader.gl;
		const vertexBuffer = buffer || gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		const location = shader.getLocation(name);
		gl.vertexAttribPointer(location, this.floatPerVertex, bufferType || gl.FLOAT, normalized||false, stride||0, offset||0);
		gl.enableVertexAttribArray(location);
		gl.bufferData(gl.ARRAY_BUFFER, (stride ? stride : this.floatPerVertex * VERTICES_PER_SPRITE ) * MAX_SPRITE * Float32Array.BYTES_PER_ELEMENT, gl.STREAM_DRAW);
		return vertexBuffer;
	}
}