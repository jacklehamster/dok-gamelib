/**
	SceneRenderer
  */

const EMPTY_VEC3 = Float32Array.of(0, 0, 0);

class SceneRenderer {
	constructor(engine, evaluator) {
		this.engine = engine;
		this.evaluator = evaluator;
		this.background = 0x000000;
		this.view = {
			pos: Float32Array.of(0, 0, 0),
			angle: 45,
		};
	}

	render(scene, nowSec) {
		const { engine, evaluator, background } = this;
		engine.clearScreen();
		const newBackground = evaluator.evaluate(scene.background);
		if (newBackground !== background) {
			engine.setBackground(newBackground);
			this.background = newBackground;
		}
		const newViewPos = evaluator.evaluate(scene.view.pos);
		if (!vec3.equals(newViewPos, this.view.pos)) {
			const [ x, y, z ] = newViewPos;
			engine.setViewPosition(x, y, z);
			this.view.pos.set(newViewPos);
		}
		const newViewAngle = evaluator.evaluate(scene.view.angle);
		if (this.view.angle !== newViewAngle) {
			engine.setViewAngle(newViewAngle);
			this.view.angle = newViewAngle;
		}
	}
}