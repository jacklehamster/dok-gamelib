/**
 *	ImageSprite
 */

class ImageSprite extends BaseSprite {
 	constructor() {
 		super();
		this.src = null;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src } = definition;
		const { instanceIndex } = this;
		const { now } = game;
		const spriteSrc = game.evaluate(src, definition, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
	}
}