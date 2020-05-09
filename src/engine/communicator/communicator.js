/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class Communicator {
	constructor(engine, sceneGL, sceneUI, domManager) {
		this.sceneGL = sceneGL;
		this.sceneUI = sceneUI;
		this.engine = engine;
		this.domManager = domManager;
	}

	applyBuffer(arrayBuffer, count, extra) {
		const { sceneGL, sceneUI, engine } = this;
		const intBuffer = new Int32Array(arrayBuffer);
		const floatBuffer = new Float32Array(arrayBuffer);

		let updatedScene = false;
		let index = 0;
		let extraIndex = 0;
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
				case Commands.UI_CREATE_ELEMENT: {
					const instanceIndex = floatBuffer[index++];
					const hasOnClick = floatBuffer[index++];
					const elementId = extra[extraIndex++];
					const type = extra[extraIndex++];
					sceneUI.createElement(elementId, instanceIndex, type, hasOnClick);
					break;
				}
				case Commands.UI_SET_PARENT: {
					const elementId = extra[extraIndex++];
					const parent = extra[extraIndex++];
					sceneUI.setParent(elementId, parent);
					break;
				}
				case Commands.UI_SET_CLASS: {
					const elementId = extra[extraIndex++];
					const classList = extra[extraIndex++];
					sceneUI.setClass(elementId, classList);
					break;
				}
				case Commands.UI_SET_STYLE: {
					const elementId = extra[extraIndex++];
					const style = extra[extraIndex++];
					const value = extra[extraIndex++];
					sceneUI.setStyle(elementId, style, value);
					break;
				}
				case Commands.UI_SET_TEXT: {
					const elementId = extra[extraIndex++];
					const text = extra[extraIndex++];
					sceneUI.setText(elementId, text);
					break;
				}
				case Commands.UI_SET_SIZE: {
					const elementId = extra[extraIndex++];
					const width = floatBuffer[index++];
					const height = floatBuffer[index++];
					sceneUI.setSize(elementId, width, height);
					break;
				}
				case Commands.UI_SET_CANVAS: {
					const elementId = extra[extraIndex++];
					const canvas = extra[extraIndex++];
					sceneUI.setCanvas(elementId, canvas);
					break;
				}
				case Commands.UI_REMOVE_ELEMENT: {
					const elementId = extra[extraIndex++];
					sceneUI.removeElement(elementId);
					break;
				}
				case Commands.ENG_NOTIFY_SCENE_CHANGE: {
					const name = extra[extraIndex++];
					engine.notifySceneChange(name);
					break;
				}
				case Commands.DOM_BG_COLOR: {
					const color = extra[extraIndex++];
					domManager.setBackgroundColor(color);
					break;
				}
			}
		}

		if (updatedScene) {
			sceneGL.resetPools();
		}
	}
}
