/*
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
 	constructor(floatPerVertex, verticesPerSprite, maxSprite) {
 		this.shaderBuffer = null;
 		this.floatPerVertex = floatPerVertex;
 		this.verticesPerSprite = verticesPerSprite;
 		this.buffer = new Float32Array(this.floatPerVertex * this.verticesPerSprite * maxSprite);
 		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
 	}

 	subarray(indexStart, indexEnd) {
 		const { buffer, floatPerVertex, verticesPerSprite } = this;
		return buffer.subarray(indexStart * verticesPerSprite * floatPerVertex, indexEnd * verticesPerSprite * floatPerVertex);
 	}

 	setShaderBuffer(shaderBuffer) {
 		this.shaderBuffer = shaderBuffer;
 	}

	assignValues(offset, ... values) {
 		const { buffer, floatPerVertex, verticesPerSprite } = this;
 		const elementOffset = offset * verticesPerSprite * floatPerVertex;
		for (let i = 0; i < values.length; i++) {
			this.buffer[elementOffset + i] = values[i];
		}
	}
}