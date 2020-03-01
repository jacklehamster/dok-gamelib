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
			pos: [0, 0, 0],
			angle: 45,
			height: 0,
			turn: 0,
		};
	}

	render(scene) {
		const { engine, evaluator, background } = this;
//		engine.clearScreen();
		const newBackground = evaluator.evaluate(scene.background);
		if (newBackground !== background) {
			engine.setBackground(newBackground);
			this.background = newBackground;
		}
		const newViewPosX = scene.view.pos ? evaluator.evaluate(scene.view.pos[0]) : 0;
		const newViewPosY = scene.view.pos ? evaluator.evaluate(scene.view.pos[1]) : 0;
		const newViewPosZ = scene.view.pos ? evaluator.evaluate(scene.view.pos[2]) : 0;
		const newHeight = evaluator.evaluate(scene.view.height) || 0;
		const newTurn = evaluator.evaluate(scene.view.turn) || 0;
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ) || newHeight !== this.view.height || newTurn !== this.view.turn) {
			engine.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newHeight, newTurn);
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			this.view.height = newHeight;
			this.view.turn = newTurn;
		}
		const newViewAngle = evaluator.evaluate(scene.view.angle);
		if (this.view.angle !== newViewAngle) {
			engine.setViewAngle(newViewAngle);
			this.view.angle = newViewAngle;
		}
	}
}