/**
  *	BaseSprite
  */

class BaseSprite {
	constructor() {
		this.providerIndex = -1;
		this.definitionIndex = -1;
		this.instanceIndex = -1;
		this.chunkIndex = -1;
		this.type = -1;
		this.updateTimes = {};
	}

	getEvaluated(game, definition) {
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const { type } = definition;

		const newType = game.evaluate(type, definition, instanceIndex) || 0;
		if (this.type !== newType) {
			this.type = newType;
			updateTimes.type = now;
		}
	}


	updateChunk(engine, chunk, now) {
		const { type, updateTimes } = this;
		if (updateTimes.type === now) {
			chunk.setType(type, now);
		}
	}
}