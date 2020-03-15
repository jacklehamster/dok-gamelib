/**
 *	ImageSprite
 */

class ImageSprite extends BaseSprite {
 	constructor() {
 		super();
		this.src = null;
		this.hidden = false;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		
		const { src, hidden } = definition;
		const { instanceIndex } = this;
		const { now } = game;
		const spriteSrc = game.evaluate(src, definition, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}

		this.setHidden(game.evaluate(hidden, definition, instanceIndex), now);
	}

	setHidden(value, now) {
		if (value !== this.hidden) {
			this.hidden = value;
			this.updateTimes.hidden = now;
		}		
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
	}
}