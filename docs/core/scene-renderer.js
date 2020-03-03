/**
	SceneRenderer
  */

const EMPTY_VEC3 = Float32Array.of(0, 0, 0);

class SceneRenderer {
	constructor(engine, evaluator) {
		this.engine = engine;
		this.evaluator = evaluator;
		this.docBackground = 0x000000;
		this.background = 0x000000;
		this.view = {
			pos: [0, 0, 0],
			angle: 0,
			height: 0,
			turn: 0,
			cameraDistance: 0,
			curvature: 0,
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
		const docBackground = evaluator.evaluate(scene.docBackground) || newBackground;
		if (docBackground !== this.docBackground) {
			document.body.style.backgroundColor = `#${docBackground.toString(16)}`;
			this.docBackground = docBackground;
		}


		const newViewPosX = scene.view.pos ? evaluator.evaluate(scene.view.pos[0]) : 0;
		const newViewPosY = scene.view.pos ? evaluator.evaluate(scene.view.pos[1]) : 0;
		const newViewPosZ = scene.view.pos ? evaluator.evaluate(scene.view.pos[2]) : 0;
		const newHeight = evaluator.evaluate(scene.view.height) || 0;
		const newTurn = evaluator.evaluate(scene.view.turn) || 0;
		const newCameraDistance = evaluator.evaluate(scene.view.cameraDistance) || 7;
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newHeight !== this.view.height || newTurn !== this.view.turn || newCameraDistance !== this.view.cameraDistance) {
			engine.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newHeight, newTurn, -newCameraDistance);
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			this.view.height = newHeight;
			this.view.turn = newTurn;
		}
		const newViewAngle = evaluator.evaluate(scene.view.angle);
		if (this.view.angle !== newViewAngle) {
			engine.setViewAngle(newViewAngle);
			this.view.angle = newViewAngle;
		}
		const newCurvature = evaluator.evaluate(scene.view.curvature) || 0;
		if (this.view.curvature !== newCurvature) {
			engine.setCurvature(newCurvature);
			this.view.curvature = newCurvature;
		}
	}
}