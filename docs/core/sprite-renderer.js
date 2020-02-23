/**
 *	SpriteRenderer
 */
class SpriteRenderer {
	constructor(engine, evaluator) {
		this.engine = engine;
		this.evaluator = evaluator;
	}

	render(sprites, timeMillis) {
		const { engine } = this;
		engine.display(sprites, timeMillis);
	}
}