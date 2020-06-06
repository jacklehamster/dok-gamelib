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
	constructor(renderer, mediaManager, domManager, socket) {
		this.mediaManager = mediaManager;
		this.renderer = renderer;
		this.domManager = domManager;
		this.socket = socket;
		this.view = {
			pos: [0, 0, 0],
			viewAngle: 0,
			tilt: 0,
			turn: 0,
			lean: 0,
			cameraDistance: 0,
			range: [0, 0],
			curvature: 0,
			viewPort: [0, 0],
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
			room: null,
		};
		this.light = {
			pos: [0, 0, 0],
			shininess: 0,
			specularStrength: 0,
			diffusionStrength: 0,
		};
	}

	render(scene) {
		const { renderer, background, domManager, mediaManager, socket } = this;
		const { settings, view, light } = scene;
		const { depthEffect, viewPort, curvature, range, viewAngle, pos, tilt, turn, lean, cameraDistance } = view;

		const newBackground = settings.background.get();
		if (newBackground !== background) {
			this.background = newBackground;
			renderer.setBackground(this.background);
		}
		const docBackground = settings.docBackground.get();
		if (docBackground !== this.docBackground) {
			this.docBackground = docBackground;
			domManager.setBackgroundColor(this.docBackground);
		}
		const newMusicSrc = settings.music.muted.get() ? null : settings.music.src.get();
		const newVolume = settings.music.volume.get();
		if (newMusicSrc !== this.settings.music.src || newVolume !== this.settings.music.volume) {
			this.settings.music.src = newMusicSrc;
			this.settings.music.volume = newVolume;
			mediaManager.setTheme(this.settings.music.src, this.settings.music.volume);
		}

		const newRoom = settings.room.get();
		if (newRoom !== this.settings.room) {
			if (this.settings.room) {
				socket.leave(this.settings.room);
			}
			this.settings.room = newRoom;
			if (this.settings.room) {
				socket.join(this.settings.room, scene.now);
			}
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
			this.light.ambient = newAmbient;
			const [ x, y, z ] = this.light.pos;
			renderer.setLight(x, y, z, newAmbient, newDiffusionStrength, newSpecularStrength, newShininess);
		}

		const newDepthFading = depthEffect.fading.get();
		const closeStaturation = depthEffect.saturation[0].get();
		const farSaturation = depthEffect.saturation[1].get();
		if (newDepthFading !== this.view.depthEffect.fading) {
			this.view.depthEffect.fading = newDepthFading;
			this.view.depthEffect.saturation[0] = closeStaturation;
			this.view.depthEffect.saturation[1] = farSaturation;
			renderer.setDepthEffect(newDepthFading, closeStaturation, farSaturation);
		}

		const newViewPosX = pos[0].get();
		const newViewPosY = pos[1].get();
		const newViewPosZ = pos[2].get();
		const newTilt = tilt.get();
		const newTurn = turn.get();
		const newLean = lean.get();
		const newCameraDistance = cameraDistance.get();
		if (!Utils.equal3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ)
			|| newTilt !== this.view.tilt || newTurn !== this.view.turn
			|| newCameraDistance !== this.view.cameraDistance
			|| newLean !== this.view.lean) {
			Utils.set3(this.view.pos, newViewPosX, newViewPosY, newViewPosZ);
			this.view.turn = newTurn;
			this.view.tilt = newTilt;
			this.view.lean = newLean;
			this.view.cameraDistance = newCameraDistance;
			renderer.setViewPosition(newViewPosX, newViewPosY, newViewPosZ, newTilt, newTurn, newLean, -newCameraDistance);
		}

		let didChangeViewport = false;
		const newViewportWidth = viewPort[0].get();
		const newViewportHeight = viewPort[1].get();
		if (this.view.viewPort[0] !== newViewportWidth || this.view.viewPort[1] !== newViewportHeight) {
			this.view.viewPort[0] = newViewportWidth;
			this.view.viewPort[1] = newViewportHeight;
			renderer.setViewport(this.view.viewPort[0], this.view.viewPort[1]);
			didChangeViewport = true;
		}

		const newNear = range[0].get();
		const newFar = range[1].get();
		const newViewAngle = viewAngle.get();
		if (this.view.viewAngle !== newViewAngle || this.view.range[0] !== newNear || this.view.range[1] !== newFar || didChangeViewport) {
			this.view.range[0] = newNear;
			this.view.range[1] = newFar;
			this.view.viewAngle = newViewAngle;
			renderer.setViewAngle(newViewAngle, newNear, newFar);
		}

		const newCurvature = curvature.get();
		if (this.view.curvature !== newCurvature) {
			this.view.curvature = newCurvature;
			renderer.setCurvature(newCurvature);
		}
	}
}