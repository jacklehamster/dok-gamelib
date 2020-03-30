/**
 *	ImageSprite
 */

class ImageSpriteInstance extends BaseSpriteInstance {
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
		const spriteSrc = src.get(instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}
	}

	updateChunk(renderer, chunk, now) {
		super.updateChunk(renderer, chunk, now);
	}
}