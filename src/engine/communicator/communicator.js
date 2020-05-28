/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/**
	Communicator

	This class reads a payload passed from a web worker (composed of an arraybuffer with bytecount and an array)
	and extract all that data to process it.
	This is a procedure that allow us to efficiently send a huge data buffer between a worker and the main thread,
	taking advantage of the fact that we can pass ArrayBuffer by reference. 
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
		this.registry = [];
		this.readBufferMethods = {};
		this.arrayPool = new Pool(() => [], array => array.length = 0);
		this.readMethods = {
			boolean: () => this.readUnsignedByte() !== 0,
			float: this.readFloat32.bind(this),
			byte: this.readUnsignedByte.bind(this),
			short: this.readShort.bind(this),
			int: this.readInt32.bind(this),
			string: this.readExtra.bind(this),
			object: this.readExtra.bind(this),
			array: this.readExtra.bind(this),
			buffer: this.readSubArray.bind(this),
		};
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

	readSubArray() {
		const size = this.readInt32();
		const value = new DataView(this.dataView.buffer, this.offset, size);
		this.offset += size;
		return value;
	}

	//	given parameter, return a function designed for loading those params.
	//	ex: getReadBufferMethod("int,float") => fun
	//	This creates a function that can read an int and a float from the paylod.
	//	const [ anInt, aFloat ] = fun()
	getReadBufferMethod(types) {
		if (!this.readBufferMethods[types]) {
			const readMethods = types.split(",").map(type => this.readMethods[type]);
			this.readBufferMethods[types] = () => {
				const result = this.arrayPool.get();
				result.length = readMethods.length;
				for (let i = 0; i < readMethods.length; i++) {
					result[i] = readMethods[i]();
				}
				return result;
			};
		}
		return this.readBufferMethods[types];
	}

	readExtra() {
		return this.extra[this.extraIndex++];
	}

	register(... actions) {
		/**
			actions in format: {
				id,	//	byte
				parameters: [ type, type, type... ],	type being "float","byte","short","int","string","object","buffer"
				apply: (value, value, value...) => ....,
			}
		*/
		actions.forEach(({ id, parameters, apply}) => {
			if (id && apply) {
				this.registry[id] = {
					name: commandName(id),
					id,
					readBuffer: this.getReadBufferMethod(parameters||""),
					apply,
				};
			}
		});
	}

	applyBuffer(arrayBuffer, byteCount, extra) {
		if (!byteCount) {
			return;
		}
		const { sceneGL, sceneUI, engine, domManager, logger, dataStore, mediaManager, newgrounds, glRenderer } = this;

		this.offset = 0;
		this.dataView = new DataView(arrayBuffer);

		this.extraIndex = 0;
		this.extra = extra;

		while (this.offset < byteCount) {
			const command = this.readUnsignedByte();
			//console.log(commandName(command));
			if (this.registry[command]) {
				const { readBuffer, apply } = this.registry[command];
				apply(...readBuffer());
				continue;
			}
			switch (command) {
				case Commands.UI_SET_PARENT: {
					const elementId = this.readExtra();
					const parent = this.readExtra();
					sceneUI.setParent(elementId, parent);
					break;
				}
				case Commands.UI_SET_CLASS: {
					const elementId = this.readExtra();
					const classList = this.readExtra();
					sceneUI.setClass(elementId, classList);
					break;
				}
				case Commands.UI_SET_STYLE: {
					const elementId = this.readExtra();
					const style = this.readExtra();
					const value = this.readExtra();
					sceneUI.setStyle(elementId, style, value);
					break;
				}
				case Commands.UI_SET_TEXT: {
					const elementId = this.readExtra();
					const text = this.readExtra();
					sceneUI.setText(elementId, text);
					break;
				}
				case Commands.UI_SET_SIZE: {
					const elementId = this.readExtra();
					const width = this.readFloat32();
					const height = this.readFloat32();
					sceneUI.setSize(elementId, width, height);
					break;
				}
				case Commands.UI_SET_CANVAS: {
					const elementId = this.readExtra();
					const canvas = this.readExtra();
					sceneUI.setCanvas(elementId, canvas);
					break;
				}
				case Commands.UI_REMOVE_ELEMENT: {
					const elementId = this.readExtra();
					sceneUI.removeElement(elementId);
					break;
				}
				case Commands.ENG_NOTIFY_SCENE_CHANGE: {
					const name = this.readExtra();
					engine.notifySceneChange(name);
					break;
				}
				case Commands.DOM_BG_COLOR: {
					const color = this.readExtra();
					domManager.setBackgroundColor(color);
					break;
				}
				case Commands.LOGGER_LOG_MESSAGE: {
					const message = this.readExtra();
					logger.log(...message);
					break;
				}
				case Commands.DATA_SAVE: {
					const data = this.readExtra();
					dataStore.sync(data);
					break;
				}
				case Commands.MEDIA_PLAY_MUSIC: {
					const id = this.readExtra();
					const url = this.readExtra();
					const reset = this.readFloat32();
					mediaManager.playMusic(id, reset, url);
					break;
				}
				case Commands.MEDIA_PAUSE_MUSIC: {
					const id = this.readExtra();
					mediaManager.pauseMusic(id);
					break;					
				}
				case Commands.MEDIA_PLAY_VIDEO: {
					const id = this.readExtra();
					const url = this.readExtra();
					const reset = this.readFloat32();
					mediaManager.playVideo(id, reset, url);
					break;
				}
				case Commands.MEDIA_PAUSE_VIDEO: {
					const id = this.readExtra();
					mediaManager.pauseVideo(id);					
					break;
				}
				case Commands.MEDIA_SET_MUSIC_VOLUME: {
					const id = this.readExtra();
					const volume = this.readFloat32();					
					mediaManager.setMusicVolume(id, volume);
					break;
				}
				case Commands.NG_UNLOCK_MEDAL: {
					const medal = this.readExtra();
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
					const buffer = this.readSubArray();
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
					break;
				}
			}
		}
		this.offset = 0;
		this.dataView = null;

		sceneGL.resetPools();
		this.arrayPool.reset();
	}
}
