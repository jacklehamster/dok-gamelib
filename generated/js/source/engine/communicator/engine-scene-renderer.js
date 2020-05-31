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

	setBackground(color) {
		this.engineCommunicator.sendCommandInt(Commands.SCENE_BACKGROUND, color);
	}

	setViewAngle(viewAngle, near, far) {
		this.engineCommunicator.loadToBuffer(Commands.SCENE_VIEWANGLE, [viewAngle, near, far]);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		this.engineCommunicator.loadToBuffer(Commands.SCENE_VIEW_POSITION, [x, y, z, tilt, turn, cameraDistance]);
	}

	setCurvature(curvature) {
		this.engineCommunicator.loadToBuffer(Commands.SCENE_CURVATURE, [curvature]);
	}

	setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess) {
		this.engineCommunicator.loadToBuffer(Commands.SCENE_LIGHT, [x, y, z, ambient, diffusionStrength, specularStrength, shininess]);
	}

	setViewport(width, height) {
		this.engineCommunicator.sendCommandInt(Commands.VIEW_RESIZE);
		this.engineCommunicator.communicator.payload.writeUnsignedShort(width);
		this.engineCommunicator.communicator.payload.writeUnsignedShort(height);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		this.engineCommunicator.loadToBuffer(Commands.SCENE_DEPTHEFFECT, [fading, closeSaturation, farSaturation]);
	}	
}