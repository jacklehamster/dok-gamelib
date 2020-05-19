/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class Communicator {
	constructor(engine, sceneGL, sceneUI, domManager, logger, dataStore, mediaManager, newgrounds, glRenderer) {
		this.sceneGL = sceneGL;
		this.sceneUI = sceneUI;
		this.engine = engine;
		this.domManager = domManager;
		this.logger = logger;
		this.dataStore = dataStore;
		this.mediaManager = mediaManager;
		this.newgrounds = newgrounds;
		this.glRenderer = glRenderer;
		this.offset = 0;
		this.dataView = null;
	}

	readUnsignedByte() {
		const value = this.dataView.getUint8(this.offset);
		this.offset += Uint8Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readShort() {
		const value = this.dataView.getUint16(this.offset, true);
		this.offset += Uint16Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readFloat32() {
		const value = this.dataView.getFloat32(this.offset, true);
		this.offset += Float32Array.BYTES_PER_ELEMENT;
		return value;
	}

	readInt32() {
		const value = this.dataView.getInt32(this.offset, true);
		this.offset += Int32Array.BYTES_PER_ELEMENT;
		return value;
	}

	readSubArray(size) {
		const value = new DataView(this.dataView.buffer, this.offset, size);
		this.offset += size;
		return value;
	}

	applyBuffer(arrayBuffer, byteCount, extra) {
		if (!byteCount) {
			return;
		}
		const { sceneGL, sceneUI, engine, domManager, logger, dataStore, mediaManager, newgrounds, glRenderer } = this;

		this.offset = 0;
		this.dataView = new DataView(arrayBuffer);

		let updatedScene = false;
		let extraIndex = 0;
		while (this.offset < byteCount) {
			const command = this.readUnsignedByte();
			//console.log(commandName(command));
			switch (command) {
				case Commands.SCENE_BACKGROUND: {
					const color = this.readFloat32();
					sceneGL.setBackground(color);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_VIEWANGLE: {
					const viewAngle = this.readFloat32();
					const near = this.readFloat32();
					const far = this.readFloat32();
					sceneGL.setViewAngle(viewAngle, near, far);
					updatedScene  = true;
					break;
				}
				case Commands.SCENE_VIEW_POSITION: {
					const x = this.readFloat32();
					const y = this.readFloat32();
					const z = this.readFloat32();
					const tilt = this.readFloat32();
					const turn = this.readFloat32();
					const cameraDistance = this.readFloat32();
					sceneGL.setViewPosition(x, y, z, tilt, turn, cameraDistance);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_CURVATURE: {
					const curvature = this.readFloat32();
					sceneGL.setCurvature(curvature);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_LIGHT: {
					const x = this.readFloat32();
					const y = this.readFloat32();
					const z = this.readFloat32();
					const ambient = this.readFloat32();
					const diffusionStrength = this.readFloat32();
					const specularStrength = this.readFloat32();
					const shininess = this.readFloat32();
					sceneGL.setLight(x, y, z, ambient, diffusionStrength, specularStrength, shininess);
					updatedScene = true;
					break;
				}
				case Commands.SCENE_DEPTHEFFECT: {
					const fading = this.readFloat32();
					const closeSaturation = this.readFloat32();
					const farSaturation = this.readFloat32();
					sceneGL.setDepthEffect(fading, closeSaturation, farSaturation);
					updatedScene = true;
					break;
				}
				case Commands.UI_CREATE_ELEMENT: {
					const instanceIndex = this.readFloat32();
					const hasOnClick = this.readFloat32();
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
					const width = this.readFloat32();
					const height = this.readFloat32();
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
					const reset = this.readFloat32();
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
					const reset = this.readFloat32();
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
					const volume = this.readFloat32();					
					mediaManager.setMusicVolume(id, volume);
					break;
				}
				case Commands.NG_UNLOCK_MEDAL: {
					const medal = extra[extraIndex++];
					newgrounds.unlockMedal(medal).then(console.log).catch(console.error);
					break;
				}
				case Commands.NG_POST_SCORE: {
					const score = this.readFloat32();
					newgrounds.postScore(score).then(console.log).catch(console.error);
					break;
				}
				case Commands.GL_UPDATE_BUFFER: {
					const bufferType = this.readUnsignedByte();
					const offset = this.readInt32();
					const size = this.readInt32();
					const buffer = this.readSubArray(size);
					glRenderer.sendBufferToGL(bufferType, offset, buffer);
					break;
				}
				case Commands.GL_SET_VISIBLE_CHUNKS: {
					const count = this.readInt32();
					glRenderer.setVisibleChunks(count);
					break;
				}
				case Commands.VIEW_RESIZE: {
					const width = this.readFloat32();
					const height = this.readFloat32();
					engine.resize(width, height);
				}
			}
		}
		this.offset = 0;
		this.dataView = null;

		if (updatedScene) {
			sceneGL.resetPools();
		}
	}
}
