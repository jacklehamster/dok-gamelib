/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineSceneRenderer {
	constructor(communicator) {
		this.communicator = communicator;
	}

	setBackground(color) {
		this.communicator.sendCommand(Commands.SCENE_BACKGROUND, color);
	}

	setViewAngle(viewAngle, near, far) {
		this.communicator.sendCommand(Commands.SCENE_VIEWANGLE, viewAngle, near, far);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		this.communicator.sendCommand(Commands.SCENE_VIEW_POSITION, x, y, z, tilt, turn, cameraDistance);
	}

	setCurvature(curvature) {
		this.communicator.sendCommand(Commands.SCENE_CURVATURE, curvature);
	}

	setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess) {
		this.communicator.sendCommand(Commands.SCENE_LIGHT, x, y, z, ambient, diffusionStrength, specularStrength, shininess);
	}

	setViewport(width, height) {
		this.communicator.sendCommand(Commands.VIEW_RESIZE, width, height);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		this.communicator.sendCommand(Commands.SCENE_DEPTHEFFECT, fading, closeSaturation, farSaturation);
	}	
}