/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class WorkerSceneGL extends ISceneGL {
    constructor(engine) {
        super();
        this.engine = engine;
    }

	setBackground(color) {
        this.engine.sendCommand("sceneGL", "setBackground", color);
	}

	setViewAngle(viewAngle, near, far) {
        this.engine.sendCommand("sceneGL", "setViewAngle", viewAngle, near, far);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
        this.engine.sendCommand("sceneGL", "setViewPosition", x, y, z, tilt, turn, cameraDistance);
	}

	setCurvature(curvature) {
        this.engine.sendCommand("sceneGL", "setCurvature", curvature);
	}

	setLight(position, ambient, diffusionStrength, specularStrength, shininess) {
        this.engine.sendCommand("sceneGL", "setLight", position, ambient, diffusionStrength, specularStrength, shininess);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
        this.engine.sendCommand("sceneGL", "setDepthEffect", fading, closeSaturation, farSaturation);
	}
}