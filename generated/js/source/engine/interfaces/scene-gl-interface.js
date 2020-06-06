/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	ISceneGL
 */

class ISceneGL {
	setBackground(color) {
		throw new Error("This method should be overwritten.");
	}

	setViewAngle(viewAngle, near, far) {
		throw new Error("This method should be overwritten.");
	}

	setViewPosition(x, y, z, tilt, turn, lean, cameraDistance) {
		throw new Error("This method should be overwritten.");
	}

	setCurvature(curvature) {
		throw new Error("This method should be overwritten.");
	}

	setLight(position, ambient, diffusionStrength, specularStrength, shininess) {
		throw new Error("This method should be overwritten.");
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		throw new Error("This method should be overwritten.");
	}
}