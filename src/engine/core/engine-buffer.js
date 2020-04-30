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
 	constructor(shader, name, floatPerVertex, verticesPerSprite, maxSprite) {
 		this.floatPerVertex = floatPerVertex;
 		this.verticesPerSprite = verticesPerSprite;
 		this.buffer = new Float32Array(this.floatPerVertex * this.verticesPerSprite * maxSprite);
 		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
 		this.shaderBuffer = this.initializeVertexBuffer(shader, name);
 	}

	initializeVertexBuffer(shader, name) {
		const gl = shader.gl;
		const location = shader.getLocation(name);
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.vertexAttribPointer(location, this.floatPerVertex, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(location);
		gl.bufferData(gl.ARRAY_BUFFER, this.floatPerVertex * MAX_SPRITE * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, gl.STREAM_DRAW);
		return vertexBuffer;
	}

 	subarray(indexStart, indexEnd) {
 		const { buffer, floatPerVertex, verticesPerSprite } = this;
		return buffer.subarray(indexStart * verticesPerSprite * floatPerVertex, indexEnd * verticesPerSprite * floatPerVertex);
 	}

	assignValues(offset, ... values) {
 		const { buffer, floatPerVertex, verticesPerSprite } = this;
 		const elementOffset = offset * verticesPerSprite * floatPerVertex;
		for (let i = 0; i < values.length; i++) {
			this.buffer[elementOffset + i] = values[i];
		}
	}
}