/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/**
	Payload
	stores serializable information into a byteBuffer.
	- bytes, short, ints, floats can be passed into ArrayBuffer.
	- objects, arrays, strings have to be passed into an array.
 */
const MAX_BUFFER_SIZE = 2000000 * Float32Array.BYTES_PER_ELEMENT;

class Payload {
	constructor(options) {
		if (!options) {
			options = {};
		}
		this.arrayPool = new Pool(() => [], array => array.length = 0);
		this.dataViewPool = new Pool(() => new DataView(new ArrayBuffer(MAX_BUFFER_SIZE)));
		this.maxSize = 0;

		this.setup();

		this.readBufferMethods = {};
		this.readMethods = {
			boolean: () => this.readUnsignedByte() !== 0,
			float: this.readFloat.bind(this),
			byte: this.readByte.bind(this),
			ubyte: this.readUnsignedByte.bind(this),
			short: this.readShort.bind(this),
			ushort: this.readUnsignedShort.bind(this),
			int: this.readInt.bind(this),
			uint: this.readUnsignedInt.bind(this),
			string: this.readExtra.bind(this),
			object: this.readExtra.bind(this),
			array: this.readExtra.bind(this),
			dataView: this.readDataView.bind(this),
		};

		this.writeBufferMethods = {};
		this.writeMethods = {
			boolean: value => this.writeUnsignedByte(value ? 1 : 0),
			float: this.writeFloat.bind(this),
			byte: this.writeByte.bind(this),
			ubyte: this.writeUnsignedByte.bind(this),
			short: this.writeShort.bind(this),
			ushort: this.writeUnsignedShort.bind(this),
			int: this.writeInt.bind(this),
			uint: this.writeUnsignedInt.bind(this),
			string: this.writeExtra.bind(this),
			object: this.writeExtra.bind(this),
			array: this.writeExtra.bind(this),
			dataView: this.writeDataView.bind(this),
		}

		this.payload = {
			action: "payload",
			time: 0,
			dataView: null,
			byteCount: 0,
			extra: null,
		};

		const { commandType }  = options;

		this.readCommand = this.readMethods[commandType] || this.readUnsignedByte.bind(this);

		const writeCommandMethod = this.writeMethods[commandType] || this.writeUnsignedByte.bind(this);
		this.writeCommand = command => {
			this.ensure();
			writeCommandMethod(command);
		};
	}

	static typeWithMul(type) {
		const [value, mul] = type.split("*").map(t => t.trim());
		return [value, isNaN(mul) ? 1 : parseInt(mul) || 1 ];
	}

	static getTypes(types) {
		const result = [];

		let subTypes = null;
		types.split(",").forEach(t => {
			if (t[0] === "[" && t[t.length-1] === "]") {	// subtype, like [byte]
				const [type, mul] = Payload.typeWithMul(t.substring(1, t.length-1).trim());
				const typeArray = [];
				for (let i = 0; i < mul; i++) {
					typeArray.push(type);
				}
				result.push(typeArray);
				return;
			} else if (t[0] === "[") {	//	subTypes start with format like [byte,....
				const [type, mul] = Payload.typeWithMul(t.substring(1).trim());
				subTypes = [];
				for (let i = 0; i < mul; i++) {
					subTypes.push(type);
				}
				return;
			} else if (t[t.length-1] === "]") {	//	subTypes end with format like ...,byte]
				const [type, mul] = Payload.typeWithMul(t.substring(0, t.length-1).trim());
				for (let i = 0; i < mul; i++) {
					subTypes.push(type);
				}
				result.push(subTypes);
				subTypes = null;
				return;
			}

			let [theType, mul] = Payload.typeWithMul(t);

			for (let i = 0; i < mul; i++) {
				if (subTypes) {
					subTypes.push(theType);
				} else {
					result.push(theType);
				}
			}
		});
		return result;
	}

	//	given parameter, return a function designed for loading those params.
	//	ex: getReadBufferMethod("int,float") => fun
	//	This creates a function that can read an int and a float from the paylod.
	//	const [ anInt, aFloat ] = fun()
	getReadBufferMethod(types) {
		if (!this.readBufferMethods[types]) {
			const readMethods = Payload.getTypes(types).map(type => {
				return Array.isArray(type) ? this.readMethods.dataView : this.readMethods[type];
			});

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

	ensure() {
		if (!this.dataView || !this.dataView.byteLength) {
			this.dataView = this.dataViewPool.get();
			this.byteCount = 0;
			this.extra.length = 0;
		}
	}

	setup(dataView, byteCount, extra) {
		this.dataView = dataView || null;
		this.byteCount = byteCount || 0;
		this.extra = extra || [];
		this.reset();
	}

	reset() {
		this.offset = 0;
		this.extraIndex = 0;
	}

	ready() {
		return this.dataView && this.dataView.byteLength;
	}

	hasData() {
		return this.offset < this.byteCount;
	}

	clear() {
		if (this.byteCount > this.maxSize) {
			this.maxSize = this.byteCount;
			const percentUsed = (100 * this.maxSize / MAX_BUFFER_SIZE);
			if (percentUsed < 80) {
				console.log(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else if (percentUsed < 100) {
				console.warn(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			} else {
				console.error(`Data buffer used: ${percentUsed.toFixed(2)}%`);
			}
		}

		this.byteCount = 0;
		this.arrayPool.reset();
	}

	//	READ FUNCTIONS

	readByte() {
		const value = this.dataView.getInt8(this.offset);
		this.offset += Int8Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readUnsignedByte() {
		const value = this.dataView.getUint8(this.offset);
		this.offset += Uint8Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readShort() {
		const value = this.dataView.getInt16(this.offset, true);
		this.offset += Int16Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readUnsignedShort() {
		const value = this.dataView.getUint16(this.offset, true);
		this.offset += Uint16Array.BYTES_PER_ELEMENT;
		return value;		
	}

	readInt() {
		const value = this.dataView.getInt32(this.offset, true);
		this.offset += Int32Array.BYTES_PER_ELEMENT;
		return value;
	}

	readUnsignedInt() {
		const value = this.dataView.getUint32(this.offset, true);
		this.offset += Uint32Array.BYTES_PER_ELEMENT;
		return value;
	}

	readFloat() {
		const value = this.dataView.getFloat32(this.offset, true);
		this.offset += Float32Array.BYTES_PER_ELEMENT;
		return value;
	}

	readDataView() {
		const size = this.readUnsignedInt();
		const value = new DataView(this.dataView.buffer, this.offset, size);
		this.offset += size;
		return value;
	}

	readExtra() {
		return this.extra[this.extraIndex++];
	}

	//	WRITE FUNCTIONS

	writeByte(value) {
		this.dataView.setInt8(this.byteCount, value);
		this.byteCount += Int8Array.BYTES_PER_ELEMENT;
	}

	writeUnsignedByte(value) {
		this.dataView.setUint8(this.byteCount, value);
		this.byteCount += Uint8Array.BYTES_PER_ELEMENT;
	}

	writeShort(value) {
		this.dataView.setInt16(this.byteCount, value, true);
		this.byteCount += Int16Array.BYTES_PER_ELEMENT;
	}

	writeUnsignedShort(value) {
		this.dataView.setUint16(this.byteCount, value, true);
		this.byteCount += Uint16Array.BYTES_PER_ELEMENT;
	}

	writeInt(value) {
		this.dataView.setInt32(this.byteCount, value, true);
		this.byteCount += Int32Array.BYTES_PER_ELEMENT;		
	}

	writeUnsignedInt(value) {
		this.dataView.setUint32(this.byteCount, value, true);
		this.byteCount += Uint32Array.BYTES_PER_ELEMENT;		
	}

	writeFloat(value) {
		this.dataView.setFloat32(this.byteCount, value, true);
		this.byteCount += Float32Array.BYTES_PER_ELEMENT;
	}

	writeDataView(value) {
		this.writeUnsignedInt(value.byteLength);
		new Uint8Array(this.dataView.buffer, this.byteCount).set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
		this.byteCount += value.byteLength;
	}

	writeExtra(value) {
		this.extra.push(value);
	}

	getByteCount() {
		return this.byteCount;
	}

	retrievePayload(payload) {
		payload.dataView = this.dataView;
		payload.byteCount = this.byteCount;
		payload.extra = this.extra;
		return this.payload;
	}

	clear() {
		this.dataView = null;
		this.byteCount = 0;
		this.extra.length = 0;		
	}
}