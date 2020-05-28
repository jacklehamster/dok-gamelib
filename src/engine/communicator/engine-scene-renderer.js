/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineSceneRenderer {
	constructor(engineCommunicator) {
		this.engineCommunicator = engineCommunicator;
	}

	loadToBuffer(commandId, ...params) {
		this.engineCommunicator.loadToBuffer(commandId, params);
	}

	setBackground(color) {
		this.engineCommunicator.sendCommandInt(Commands.SCENE_BACKGROUND, color);
	}

	setViewAngle(viewAngle, near, far) {
		this.loadToBuffer(Commands.SCENE_VIEWANGLE, viewAngle, near, far);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		this.loadToBuffer(Commands.SCENE_VIEW_POSITION, x, y, z, tilt, turn, cameraDistance);
	}

	setCurvature(curvature) {
		this.loadToBuffer(Commands.SCENE_CURVATURE, curvature);
	}

	setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess) {
		this.loadToBuffer(Commands.SCENE_LIGHT, x, y, z, ambient, diffusionStrength, specularStrength, shininess);
	}

	setViewport(width, height) {
		this.engineCommunicator.sendCommandInt(Commands.VIEW_RESIZE);
		this.engineCommunicator.writeShort(width, height);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		this.loadToBuffer(Commands.SCENE_DEPTHEFFECT, fading, closeSaturation, farSaturation);
	}	
}