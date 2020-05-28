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
					if (!readMethods[i]) {
						console.error(`${types} <= invalid types.`);
					}
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
			} else {
				console.error(`Unknown command: ${commandName(command)} (${command})`);
			}
		}
		this.offset = 0;
		this.dataView = null;

		sceneGL.resetPools();
		this.arrayPool.reset();
	}
}
