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
		
		const { src, hidden } = definition;
		const { instanceIndex } = this;
		const { now } = game;
		const spriteSrc = game.evaluate(hidden, this, instanceIndex) ? null : game.evaluate(src, this, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}
	}
}