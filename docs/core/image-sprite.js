/**
 *	ImageSprite
 */

class ImageSprite extends BaseSprite {
 	constructor() {
 		super();
		this.src = null;
		this.light = 0;
		this.hidden = false;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		
		const { src, hidden, light } = definition;
		const { instanceIndex } = this;
		const { now } = game;
		const spriteSrc = game.evaluate(src, definition, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}

		const spriteHidden = game.evaluate(hidden, definition, instanceIndex);
		if (spriteHidden !== this.hidden) {
			this.hidden = spriteHidden;
			this.updateTimes.hidden = now;
		}

		const spriteLight = game.evaluate(light, definition, instanceIndex);
		if (spriteLight !== this.light) {
			this.light = spriteLight;
			this.updateTimes.light = now;
		}
	}

	updateChunk(engine, chunk, now) {
		super.updateChunk(engine, chunk, now);
		const { light, updateTimes } = this;
		if (updateTimes.light === now) {
			chunk.setLight(light, now);			
		}
	}
}