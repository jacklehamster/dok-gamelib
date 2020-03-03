/**
 *	SpriteRenderer
 */
class SpriteRenderer {
	constructor(engine, evaluator) {
		this.engine = engine;
		this.evaluator = evaluator;
	}

	render(sprites, now) {
		const { engine } = this;
		engine.display(sprites, now);
	}
}