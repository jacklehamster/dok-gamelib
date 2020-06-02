/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineSceneRenderer {
	constructor(bufferTransport) {
		this.bufferTransport = bufferTransport;
	}

	setBackground(color) {
		this.bufferTransport.sendCommand(Commands.SCENE_BACKGROUND, color);
	}

	setViewAngle(viewAngle, near, far) {
		this.bufferTransport.sendCommand(Commands.SCENE_VIEWANGLE, viewAngle, near, far);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		this.bufferTransport.sendCommand(Commands.SCENE_VIEW_POSITION, x, y, z, tilt, turn, cameraDistance);
	}

	setCurvature(curvature) {
		this.bufferTransport.sendCommand(Commands.SCENE_CURVATURE, curvature);
	}

	setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess) {
		this.bufferTransport.sendCommand(Commands.SCENE_LIGHT, x, y, z, ambient, diffusionStrength, specularStrength, shininess);
	}

	setViewport(width, height) {
		this.bufferTransport.sendCommand(Commands.VIEW_RESIZE, width, height);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		this.bufferTransport.sendCommand(Commands.SCENE_DEPTHEFFECT, fading, closeSaturation, farSaturation);
	}	
}