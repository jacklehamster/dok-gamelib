/*
 * EngineBuffer
 */

 class EngineBuffer
 {
 	constructor(floatPerVertex, verticesPerSprite, maxSprite) {
 		this.floatPerVertex = floatPerVertex;
 		this.verticesPerSprite = verticesPerSprite;
 		this.buffer = new Float32Array(this.floatPerVertex * this.verticesPerSprite * maxSprite);
 		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
 	}

 	subarray(indexStart, indexEnd) {
 		const { buffer, floatPerVertex, verticesPerSprite } = this;
		return buffer.subarray(indexStart * verticesPerSprite * floatPerVertex, indexEnd * verticesPerSprite * floatPerVertex);
 	}
 }