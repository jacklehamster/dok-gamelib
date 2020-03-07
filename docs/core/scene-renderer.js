/**
	SceneRenderer
  */

class SceneRenderer {
	constructor(glRenderer, game) {
		this.glRenderer = glRenderer;
		this.game = game;
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
		this.game.evaluate(init, scene);
	}

	render(scene) {
		const { glRenderer, game, background } = this;
		const { settings, view, refresh } = scene;

		game.evaluate(refresh, scene);

		const newBackground = game.evaluate(settings.background);
		if (newBackground !== background) {
			glRenderer.setBackground(newBackground);
			this.background = newBackground;
		}
		const docBackground = game.evaluate(settings.docBackground);
		if (docBackground !== this.docBackground) {
			document.body.style.backgroundColor = `#${(0x1000000 | docBackground).toString(16).substr(1)}`;
			this.docBackground = docBackground;
		}

		const newViewPosX = view.pos ? game.evaluate(view.pos[0]) : 0;
		const newViewPosY = view.pos ? game.evaluate(view.pos[1]) : 0;
		const newViewPosZ = view.pos ? game.evaluate(view.pos[2]) : 0;
		const newHeight = game.evaluate(view.height) || 0;
		const newTurn = game.evaluate(view.turn) || 0;
		const newCameraDistance = game.evaluate(view.cameraDistance) || 7;
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newHeight !== this.view.height || newTurn !== this.view.turn || newCameraDistance !== this.view.cameraDistance) {
			glRenderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newHeight, newTurn, -newCameraDistance);
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			this.view.height = newHeight;
			this.view.turn = newTurn;
		}
		const newViewAngle = game.evaluate(view.angle);
		if (this.view.angle !== newViewAngle) {
			glRenderer.setViewAngle(newViewAngle);
			this.view.angle = newViewAngle;
		}
		const newCurvature = game.evaluate(settings.curvature) || 0;
		if (this.view.curvature !== newCurvature) {
			glRenderer.setCurvature(newCurvature);
			this.view.curvature = newCurvature;
		}
	}
}