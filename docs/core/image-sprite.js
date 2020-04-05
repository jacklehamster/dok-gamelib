/**
 *	ImageSprite
 */

class ImageSpriteInstance extends BaseSpriteInstance {
 	constructor() {
 		super();
		this.src = null;
		this.tintColor = 0;
		this.brightness = 0;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src, tintColor } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const spriteSrc = src.get(instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			updateTimes.src = now;
		}

		const newTintColor = tintColor.get(instanceIndex);
		if (newTintColor !== this.tintColor) {
			this.tintColor = newTintColor;
			updateTimes.tintColor = now;
		}
	}

	updateChunkTint(chunk, now) {
		const { tintColor, padding } = this;
		chunk.setTint(tintColor, now);
	}

	updateChunk(renderer, chunk, now) {
		super.updateChunk(renderer, chunk, now);
		const { updateTimes } = this;

		if (updateTimes.tintColor === now) {
			this.updateChunkTint(chunk, now);
		}
	}
}