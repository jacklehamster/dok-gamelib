/**
 *	ImageSprite
 */

class ImageSprite extends BaseSprite {
 	constructor() {
 		super();
		this.src = null;
 	}

	getEvaluated(evaluator, definition) {
		const { src } = definition;
		const { instanceIndex } = this;
		const { timeMillis } = evaluator;
		const spriteSrc = evaluator.evaluate(src, this, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = timeMillis;
		}
	}
}