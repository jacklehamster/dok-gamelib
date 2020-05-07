/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class Communicator {
	constructor(sceneGL) {
		this.sceneGL = sceneGL;
	}

	applyBuffer(arrayBuffer, count) {
		const { sceneGL } = this;
		const intBuffer = new Int32Array(arrayBuffer);
		const floatBuffer = new Float32Array(arrayBuffer);

		let updatedScene = false;
		let index = 0;
		while (index < count) {
			const command = intBuffer[index++];
			switch (command) {
				case Commands.SCENE_BACKGROUND: {
					const color = floatBuffer[index++];
					sceneGL.setBackground(color);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_VIEWANGLE: {
					const viewAngle = floatBuffer[index++];
					const near = floatBuffer[index++];
					const far = floatBuffer[index++];
					sceneGL.setViewAngle(viewAngle, near, far);
					updatedScene  = true;
					break;
				}
				case Commands.SCENE_VIEW_POSITION: {
					const x = floatBuffer[index++];
					const y = floatBuffer[index++];
					const z = floatBuffer[index++];
					const tilt = floatBuffer[index++];
					const turn = floatBuffer[index++];
					const cameraDistance = floatBuffer[index++];
					sceneGL.setViewPosition(x, y, z, tilt, turn, cameraDistance);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_CURVATURE: {
					const curvature = floatBuffer[index++];
					sceneGL.setCurvature(curvature);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_LIGHT: {
					const x = floatBuffer[index++];
					const y = floatBuffer[index++];
					const z = floatBuffer[index++];
					const ambient = floatBuffer[index++];
					const diffusionStrength = floatBuffer[index++];
					const specularStrength = floatBuffer[index++];
					const shininess = floatBuffer[index++];
					sceneGL.setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_DEPTHEFFECT: {
					const fading = floatBuffer[index++];
					const closeSaturation = floatBuffer[index++];
					const farSaturation = floatBuffer[index++];
					sceneGL.setDepthEffect(fading, closeSaturation, farSaturation);
					updatedScene = true;
					break;
				}
			}
		}

		if (updatedScene) {
			sceneGL.resetPools();
		}
	}
}
