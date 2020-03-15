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
		this.light = {
			pos: [0, 0, 0],
			shininess: 0,
			specularStrength: 0,
			diffusionStrength: 0,
		};
	}

	init(game) {
		const { init } = game;
		game.evaluate(init);
	}

	refresh(scene) {
		scene.evaluate(scene.refresh);
	}

	render(scene) {
		const { glRenderer, background } = this;
		const { settings, view, light } = scene;

		const newBackground = scene.evaluate(settings.background);
		if (newBackground !== background) {
			glRenderer.setBackground(newBackground);
			this.background = newBackground;
		}
		const docBackground = scene.evaluate(settings.docBackground);
		if (docBackground !== this.docBackground) {
			document.body.style.backgroundColor = Utils.getDOMColor(docBackground);
			this.docBackground = docBackground;
		}

		const newLightPosX = scene.evaluate(light.pos[0]);
		const newLightPosY = scene.evaluate(light.pos[1]);
		const newLightPosZ = scene.evaluate(light.pos[2]);
		const newDiffusionStrength = scene.evaluate(light.diffusionStrength);
		const newSpecularStrength = scene.evaluate(light.specularStrength);
		const newShininess = scene.evaluate(light.shininess);
		const newAmbient = scene.evaluate(light.ambient);
		if (!Utils.equal3(this.light.pos, newLightPosX, newLightPosY, newLightPosZ)
			|| newDiffusionStrength !== this.light.diffusionStrength
			|| newSpecularStrength !== this.light.specularStrength
			|| newShininess !== this.light.shininess
			|| newAmbient !== this.light.ambient) {
			Utils.set3(this.light.pos, newLightPosX, newLightPosY, newLightPosZ);
			this.light.diffusionStrength = newDiffusionStrength;
			this.light.specularStrength = newSpecularStrength;
			this.light.shininess = newShininess;
			glRenderer.setLight(this.light.pos, newAmbient, newDiffusionStrength, newSpecularStrength, newShininess);
		}

		const newViewPosX = scene.evaluate(view.pos[0]);
		const newViewPosY = scene.evaluate(view.pos[1]);
		const newViewPosZ = scene.evaluate(view.pos[2]);
		const newHeight = scene.evaluate(view.height);
		const newTurn = scene.evaluate(view.turn);
		const newCameraDistance = scene.evaluate(view.cameraDistance);
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newHeight !== this.view.height || newTurn !== this.view.turn || newCameraDistance !== this.view.cameraDistance) {
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			glRenderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newHeight, newTurn, -newCameraDistance);
			this.view.height = newHeight;
			this.view.turn = newTurn;
		}
		const newViewAngle = scene.evaluate(view.angle);
		const newNear = scene.evaluate(view.range[0]);
		const newFar = scene.evaluate(view.range[1]);
		if (this.view.angle !== newViewAngle) {
			glRenderer.setViewAngle(newViewAngle, newNear, newFar);
			this.view.angle = newViewAngle;
		}
		const newCurvature = scene.evaluate(settings.curvature);
		if (this.view.curvature !== newCurvature) {
			glRenderer.setCurvature(newCurvature);
			this.view.curvature = newCurvature;
		}
	}
}