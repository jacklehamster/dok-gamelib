/**
 *	ImageSprite
 */

class ImageSprite extends BaseSprite {
 	constructor() {
 		super();
		this.src = null;
 	}

	getEvaluated(evaluator, definition) {
		super.getEvaluated(evaluator, definition);
		
		const { src, hidden } = definition;
		const { instanceIndex } = this;
		const { now } = evaluator;
		const spriteSrc = evaluator.evaluate(hidden, this, instanceIndex) ? null : evaluator.evaluate(src, this, instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.updateTimes.src = now;
		}
	}
}