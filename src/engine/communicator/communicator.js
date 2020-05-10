/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class Communicator {
	constructor(engine, sceneGL, sceneUI, domManager, logger, dataStore, mediaManager, newgrounds) {
		this.sceneGL = sceneGL;
		this.sceneUI = sceneUI;
		this.engine = engine;
		this.domManager = domManager;
		this.logger = logger;
		this.dataStore = dataStore;
		this.mediaManager = mediaManager;
		this.newgrounds = newgrounds;
	}

	applyBuffer(arrayBuffer, count, extra) {
		const { sceneGL, sceneUI, engine, domManager, logger, dataStore, mediaManager, newgrounds } = this;
		const intBuffer = new Int32Array(arrayBuffer);
		const floatBuffer = new Float32Array(arrayBuffer);

		let updatedScene = false;
		let index = 0;
		let extraIndex = 0;
		while (index < count) {
			const command = intBuffer[index++];
//			console.log(commandName(command));
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
				case Commands.LOGGER_LOG_MESSAGE: {
					const message = extra[extraIndex++];
					logger.log(...message);
					break;
				}
				case Commands.DATA_SAVE: {
					const data = extra[extraIndex++];
					dataStore.sync(data);
					break;
				}
				case Commands.MEDIA_PLAY_MUSIC: {
					const id = extra[extraIndex++];
					const url = extra[extraIndex++];
					const reset = floatBuffer[index++];
					mediaManager.playMusic(id, reset, url);
					break;
				}
				case Commands.MEDIA_PAUSE_MUSIC: {
					const id = extra[extraIndex++];
					mediaManager.pauseMusic(id);
					break;					
				}
				case Commands.MEDIA_PLAY_VIDEO: {
					const id = extra[extraIndex++];
					const url = extra[extraIndex++];
					const reset = floatBuffer[index++];
					mediaManager.playVideo(id, reset, url);
					break;
				}
				case Commands.MEDIA_PAUSE_VIDEO: {
					const id = extra[extraIndex++];
					mediaManager.pauseVideo(id);					
					break;
				}
				case Commands.MEDIA_SET_MUSIC_VOLUME: {
					const id = extra[extraIndex++];
					const volume = floatBuffer[index++];					
					mediaManager.setMusicVolume(id, volume);
					break;
				}
				case Commands.NG_UNLOCK_MEDAL: {
					const medal = extra[extraIndex++];
					newgrounds.unlockMedal(medal).then(console.log).catch(console.error);
					break;
				}
				case Commands.NG_POST_SCORE: {
					const score = floatBuffer[index++];
					newgrounds.postScore(score).then(console.log).catch(console.error);
					break;
				}
			}
		}

		if (updatedScene) {
			sceneGL.resetPools();
		}
	}
}
