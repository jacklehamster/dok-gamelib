/**
	SceneRenderer
  */

class SceneRenderer {
	constructor(glRenderer) {
		this.glRenderer = glRenderer;
		this.view = {
			pos: [0, 0, 0],
			viewAngle: 0,
			tilt: 0,
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
		init.run();
	}

	refresh(scene) {
		const refreshRate = scene.refreshRate.get();
		if (refreshRate && scene.now - scene.lastRefresh < 1000 / refreshRate) {
			return;
		}
		scene.refresh.run();
		scene.lastRefresh = scene.now;
	}

	render(scene) {
		const { glRenderer, background } = this;
		const { settings, view, light } = scene;

		const newBackground = settings.background.get();
		if (newBackground !== background) {
			glRenderer.setBackground(newBackground);
			this.background = newBackground;
		}
		const docBackground = settings.docBackground.get();
		if (docBackground !== this.docBackground) {
			document.body.style.backgroundColor = Utils.getDOMColor(docBackground);
			this.docBackground = docBackground;
		}

		const newLightPosX = light.pos[0].get();
		const newLightPosY = light.pos[1].get();
		const newLightPosZ = light.pos[2].get();
		const newDiffusionStrength = light.diffusionStrength.get();
		const newSpecularStrength = light.specularStrength.get();
		const newShininess = light.shininess.get();
		const newAmbient = light.ambient.get();
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

		const newViewPosX = view.pos[0].get();
		const newViewPosY = view.pos[1].get();
		const newViewPosZ = view.pos[2].get();
		const newTilt = view.tilt.get();
		const newTurn = view.turn.get();
		const newCameraDistance = view.cameraDistance.get();
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newTilt !== this.view.tilt || newTurn !== this.view.turn || newCameraDistance !== this.view.cameraDistance) {
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			glRenderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newTilt, newTurn, -newCameraDistance);
			this.view.turn = newTurn;
		}
		const newViewAngle = view.viewAngle.get();
		const newNear = view.range[0].get();
		const newFar = view.range[1].get();
		if (this.view.viewAngle !== newViewAngle) {
			glRenderer.setViewAngle(newViewAngle, newNear, newFar);
			this.view.viewAngle = newViewAngle;
		}
		const newCurvature = settings.curvature.get();
		if (this.view.curvature !== newCurvature) {
			glRenderer.setCurvature(newCurvature);
			this.view.curvature = newCurvature;
		}
	}
}