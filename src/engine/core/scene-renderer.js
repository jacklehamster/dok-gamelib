/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	SceneRenderer
  */

class SceneRenderer {
	constructor(glRenderer, mediaManager) {
		this.mediaManager = mediaManager;
		this.glRenderer = glRenderer;
		this.view = {
			pos: [0, 0, 0],
			viewAngle: 0,
			tilt: 0,
			turn: 0,
			cameraDistance: 0,
			range: [0, 0],
			curvature: 0,
			depthEffect: {
				fading: 0,
				saturation: [0, 0],
			},
		};
		this.settings = {
			docBackground : 0x000000,
			background : 0x000000,
			music: {
				src: null,
				volume: 1,
			},
		};
		this.light = {
			pos: [0, 0, 0],
			shininess: 0,
			specularStrength: 0,
			diffusionStrength: 0,
		};
	}

	render(scene) {
		const { glRenderer, background } = this;
		const { settings, view, light } = scene;
		const { depthEffect } = view;

		const newBackground = settings.background.get();
		if (newBackground !== background) {
			this.background = newBackground;
			glRenderer.setBackground(this.background);
		}
		const docBackground = settings.docBackground.get();
		if (docBackground !== this.docBackground) {
			this.docBackground = docBackground;
			document.body.style.backgroundColor = Utils.getDOMColor(this.docBackground);
		}
		const newMusicSrc = settings.music.muted.get() ? null : settings.music.src.get();
		const newVolume = settings.music.volume.get();
		if (newMusicSrc !== this.settings.music.src || newVolume !== this.settings.music.volume) {
			this.settings.music.src = newMusicSrc;
			this.settings.music.volume = newVolume;
			this.mediaManager.setTheme(this.settings.music.src, this.settings.music.volume);
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

		const newDepthFading = depthEffect.fading.get();
		const closeStaturation = depthEffect.saturation[0].get();
		const farSaturation = depthEffect.saturation[1].get();
		if (newDepthFading !== this.view.depthEffect.fading) {
			this.view.depthEffect.fading = newDepthFading;
			this.view.depthEffect.saturation[0] = closeStaturation;
			this.view.depthEffect.saturation[1] = farSaturation;
			glRenderer.setDepthEffect(newDepthFading, closeStaturation, farSaturation);
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
			this.view.turn = newTurn;
			glRenderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newTilt, newTurn, -newCameraDistance);
		}

		const newNear = view.range[0].get();
		const newFar = view.range[1].get();
		const newViewAngle = view.viewAngle.get();
		if (this.view.viewAngle !== newViewAngle || this.view.range[0] !== newNear || this.view.range[1] !== newFar) {
			this.view.range[0] = newNear;
			this.view.range[1] = newFar;
			this.view.viewAngle = newViewAngle;
			glRenderer.setViewAngle(newViewAngle, newNear, newFar);
		}

		const newCurvature = view.curvature.get();
		if (this.view.curvature !== newCurvature) {
			this.view.curvature = newCurvature;
			glRenderer.setCurvature(newCurvature);
		}
	}
}