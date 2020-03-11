/**
	SceneRenderer
  */

class SceneRenderer {
	constructor(glRenderer) {
		this.glRenderer = glRenderer;
		this.view = {
			pos: [0, 0, 0],
			angle: 0,
			height: 0,
			turn: 0,
			cameraDistance: 0,
		};
		this.settings = {
			docBackground : 0x000000,
			background : 0x000000,
			curvature: 0,
		};
	}

	init(scene) {
		const { init } = scene;
		scene.evaluate(init, scene);
	}

	render(scene) {
		const { glRenderer, background } = this;
		const { settings, view, refresh } = scene;

		scene.evaluate(refresh, scene);

		const newBackground = scene.evaluate(settings.background, scene);
		if (newBackground !== background) {
			glRenderer.setBackground(newBackground);
			this.background = newBackground;
		}
		const docBackground = scene.evaluate(settings.docBackground, scene);
		if (docBackground !== this.docBackground) {
			document.body.style.backgroundColor = Utils.getDOMColor(docBackground);
			this.docBackground = docBackground;
		}

		const newViewPosX = scene.evaluate(view.pos[0], scene);
		const newViewPosY = scene.evaluate(view.pos[1], scene);
		const newViewPosZ = scene.evaluate(view.pos[2], scene);
		const newHeight = scene.evaluate(view.height, scene);
		const newTurn = scene.evaluate(view.turn, scene);
		const newCameraDistance = scene.evaluate(view.cameraDistance, scene);
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newHeight !== this.view.height || newTurn !== this.view.turn || newCameraDistance !== this.view.cameraDistance) {
			glRenderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newHeight, newTurn, -newCameraDistance);
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			this.view.height = newHeight;
			this.view.turn = newTurn;
		}
		const newViewAngle = scene.evaluate(view.angle, scene);
		if (this.view.angle !== newViewAngle) {
			glRenderer.setViewAngle(newViewAngle);
			this.view.angle = newViewAngle;
		}
		const newCurvature = scene.evaluate(settings.curvature, scene);
		if (this.view.curvature !== newCurvature) {
			glRenderer.setCurvature(newCurvature);
			this.view.curvature = newCurvature;
		}
	}
}