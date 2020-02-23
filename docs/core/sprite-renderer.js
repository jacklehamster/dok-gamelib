/**
 *	SpriteRenderer
 */
class SpriteRenderer {
	constructor(engine, evaluator) {
		this.engine = engine;
		this.evaluator = evaluator;
	}

	render(sprites, nowSec) {
		const { engine } = this;
		engine.display(sprites, nowSec);
	}
}