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

//	type needs to be stored for object
const PayloadTypes = {
	Null: 0,
	Boolean: 1,
	Float: 2,
	Byte: 3,
	UnsignedByte: 4,
	Short: 5,
	UnsignedShort: 6,
	Int: 7,
	UnsignedInt: 8,
	String: 9,
	Object: 10,
	Array: 11,
	DataView: 12,
	Undefined: 13,
};

class PayloadProducer {
	constructor(options) {
		if (!options) {
			options = {};
		}
		this.arrayPool = new Pool(() => [], array => array.length = 0);
		this.objectPool = new Pool(() => { return {}; }, obj => { for(let i in obj)delete obj[i]; });
		this.payloadPool = new Pool(() => { return {}; });
		this.dataViewPool = new Pool(() => new DataView(new ArrayBuffer(MAX_BUFFER_SIZE)));
		this.maxSize = 0;
		this.lastDataViewOffset = -1;

		this.setup();

		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder();

		this.readBufferMethods = {};
		this.writeBufferMethods = {};
		this.mergeBufferMethods = {};
		this.dataViewBufferSizes = {};

		this.readMethods = {
			boolean: () => this.readUnsignedByte() !== 0,
			float: this.readFloat.bind(this),
			byte: this.readByte.bind(this),
			ubyte: this.readUnsignedByte.bind(this),
			short: this.readShort.bind(this),
			ushort: this.readUnsignedShort.bind(this),
			int: this.readInt.bind(this),
			uint: this.readUnsignedInt.bind(this),
			string: this.readString.bind(this),
			object: this.readObject.bind(this),
			array: this.readArray.bind(this),
			dataView: this.readDataView.bind(this),
		};

		this.writeMethods = {
			boolean: value => this.writeUnsignedByte(value ? 1 : 0),
			float: this.writeFloat.bind(this),
			byte: this.writeByte.bind(this),
			ubyte: this.writeUnsignedByte.bind(this),
			short: this.writeShort.bind(this),
			ushort: this.writeUnsignedShort.bind(this),
			int: this.writeInt.bind(this),
			uint: this.writeUnsignedInt.bind(this),
			string: this.writeString.bind(this),
			object: this.writeObject.bind(this),
			array: this.writeArray.bind(this),
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

	canMerge() {
		if (this.lastDataViewOffset < 0) {
			return false;
		}
		const size = this.getLastDataViewBufferSize();
		return this.lastDataViewOffset + Uint32Array.BYTES_PER_ELEMENT + size === this.byteCount;
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
				const [type, mul] = PayloadProducer.typeWithMul(t.substring(1, t.length-1).trim());
				const typeArray = [];
				for (let i = 0; i < mul; i++) {
					typeArray.push(type);
				}
				result.push(typeArray);
				return;
			} else if (t[0] === "[") {	//	subTypes start with format like [byte,....
				const [type, mul] = PayloadProducer.typeWithMul(t.substring(1).trim());
				subTypes = [];
				for (let i = 0; i < mul; i++) {
					subTypes.push(type);
				}
				return;
			} else if (t[t.length-1] === "]") {	//	subTypes end with format like ...,byte]
				const [type, mul] = PayloadProducer.typeWithMul(t.substring(0, t.length-1).trim());
				for (let i = 0; i < mul; i++) {
					subTypes.push(type);
				}
				result.push(subTypes);
				subTypes = null;
				return;
			}

			let [theType, mul] = PayloadProducer.typeWithMul(t);

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

	static totalSize(typeArray) {
		let size = 0;
		for (let i = 0; i < typeArray.length; i++) {
			switch(typeArray[i]) {
				case "boolean":
				case "ubyte":
					size += Uint8Array.BYTES_PER_ELEMENT;
					break;
				case "byte":
					size += Int8Array.BYTES_PER_ELEMENT;
					break;
				case "float":
					size += Float32Array.BYTES_PER_ELEMENT;
					break;
				case "short":
					size += Int16Array.BYTES_PER_ELEMENT;
					break;
				case "ushort":
					size += Uint16Array.BYTES_PER_ELEMENT;
					break;
				case "int":
					size += Int32Array.BYTES_PER_ELEMENT;
					break;
				case "uint":
					size += Uint32Array.BYTES_PER_ELEMENT;
					break;
			}
		}
		return size;
	}

	//	Produce a writer prefixed with writing a size of the dataview
	makeWriterPrefixedWithSize(typeArray, dataWriter) {
		const dataViewSize = PayloadProducer.totalSize(typeArray);
		return (value) => {
			this.lastDataViewOffset = this.byteCount;
			this.writeUnsignedInt(dataViewSize);
			dataWriter(value);
		};
	}

	//	given parameter, return a function designed for loading those params.
	//	ex: getReadBufferMethod("int,float") => fun
	//	This creates a function that can read an int and a float from the paylod.
	//	const [ anInt, aFloat ] = fun()
	getReadBufferMethod(parameters) {
		if (!this.readBufferMethods[parameters]) {
			const readers = [];
			PayloadProducer.getTypes(parameters).forEach(type => {
				if (Array.isArray(type)) {
					readers.push(this.readMethods.dataView);
				} else {
					readers.push(this.readMethods[type]);
				}
			});

			this.readBufferMethods[parameters] = () => {
				const result = this.arrayPool.get();
				result.length = readers.length;
				for (let i = 0; i < readers.length; i++) {
					if (!readers[i]) {
						console.error(`${parameters} <= invalid parameters.`);
					}
					result[i] = readers[i]();
				}
				return result;
			};
		}
		return this.readBufferMethods[parameters];
	}

	getWriteBufferMethod(parameters) {
		if (!this.writeBufferMethods[parameters]) {
			const writers = [];
			let dataViewIndex = -1;
			PayloadProducer.getTypes(parameters).forEach(type => {
				if (Array.isArray(type)) {
					if (dataViewIndex < 0) {
						dataViewIndex = writers.length;
					}
					type.forEach((t, index) => {
						if (index === 0) {
							writers.push(this.makeWriterPrefixedWithSize(type, this.writeMethods[t]));
						} else {
							writers.push(this.writeMethods[t]);
						}
					});
				} else {
					writers.push(this.writeMethods[type]);
				}
			});

			this.writeBufferMethods[parameters] = (command, ...params) => {
				this.writeCommand(command);
				for (let i = 0; i < writers.length; i++) {
					const writer = writers[Math.min(writers.length-1, i)];
					if (!writer) {
						console.error(`${parameters} <= invalid parameters.`);
					}
					writer(params[i]);
				}
			};
		}
		return this.writeBufferMethods[parameters];
	}

	getDataViewSize(parameters) {
		if (typeof(this.dataViewBufferSizes[parameters]) === "undefined") {
			let size = 0;
			PayloadProducer.getTypes(parameters).forEach((type, index) => {
				if (Array.isArray(type)) {
					size = PayloadProducer.totalSize(type);
				}
			});
			this.dataViewBufferSizes[parameters] = size;
		}
		return this.dataViewBufferSizes[parameters];
	}

	getMergeBufferMethod(parameters) {
		if (!this.mergeBufferMethods[parameters]) {
			let dataViewIndex = -1;
			const writers = [];
			PayloadProducer.getTypes(parameters).forEach((type, index) => {
				if (Array.isArray(type)) {
					if (dataViewIndex < 0) {
						dataViewIndex = writers.length;
					}
					type.forEach((t, index) => {
						writers.push(this.writeMethods[t]);
					});
				} else {
					writers.push(this.writeMethods[type]);
				}
			});

			const writeMethod = this.getWriteBufferMethod(parameters);

			if (dataViewIndex < 0) {
				this.mergeBufferMethods[parameters] = writeMethod;
			} else {
				this.mergeBufferMethods[parameters] = (command, ...params) => {
					//	write starting from dataview
					const previousByteCount = this.byteCount;
					for (let i = 0; i < writers.length; i++) {
						const writer = writers[Math.min(writers.length-1, i)];
						if (!writer) {
							console.error(`${parameters} <= invalid parameters.`);
						}
						if (i >= dataViewIndex) {
							writer(params[i]);
						}
					}
					const byteDiff = this.byteCount - previousByteCount;
					const previousDataViewSize = this.getLastDataViewBufferSize();
					this.dataView.setUint32(this.lastDataViewOffset, previousDataViewSize + byteDiff, true);
				};
			}
		}
		return this.mergeBufferMethods[parameters];
	}

	getLastDataViewBufferSize() {
		return this.lastDataViewOffset >= 0 ? this.dataView.getUint32(this.lastDataViewOffset, true) : 0;
	}

	ensure() {
		if (!this.dataView || !this.dataView.byteLength) {
			this.dataView = this.dataViewPool.get();
			this.byteCount = 0;
		}
	}

	setup(dataView, byteCount, extra) {
		this.dataView = dataView || null;
		this.byteCount = byteCount || 0;
		this.lastDataViewOffset = -1;
		this.reset();
	}

	reset() {
		this.offset = 0;
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

		this.dataView = null;
		this.byteCount = 0;
		this.lastDataViewOffset = -1;
		this.arrayPool.reset();
		this.objectPool.reset();
		this.payloadPool.reset();
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

	readString() {
		return this.decoder.decode(this.readDataView());
	}

	readObject() {
		const type = this.readUnsignedByte();
		switch (type) {
			case PayloadTypes.Null:
				return null;
			case PayloadTypes.Boolean:
				return this.readByte() !== 0;
			case PayloadTypes.Float:
				return this.readFloat();
			case PayloadTypes.Byte:
				return this.readByte();
			case PayloadTypes.UnsignedByte:
				return this.readUnsignedByte();
			case PayloadTypes.Short:
				return this.readShort();
			case PayloadTypes.UnsignedShort:
				return this.readUnsignedShort();
			case PayloadTypes.Int:
				return this.readInt();
			case PayloadTypes.UnsignedInt:
				return this.readUnsignedInt();
			case PayloadTypes.String:
				return this.readString();
			case PayloadTypes.Array:
				return this.readArray();
			case PayloadTypes.DataView:
				return this.readDataView();
			case PayloadTypes.Undefined:
				return undefined;
			case PayloadTypes.Object:
				const countProps = this.readUnsignedShort();
				const obj = this.objectPool.get(true);
				for (let i = 0; i < countProps; i++) {
					const prop = this.readString();
					obj[prop] = this.readObject();
				}
				return obj;
			default:
				console.error(`Invalid object type ${type}`);
		}
		return null;
	}

	readArray() {
		const array = [];
		const size = this.readUnsignedInt();
		for (let i = 0; i < size; i++) {
			array.push(this.readObject());
		}
		return array;
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

	writeDataView(dataView) {
		this.writeUnsignedInt(dataView.byteLength);
		new Uint8Array(this.dataView.buffer).set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength), this.byteCount);
		this.byteCount += dataView.byteLength;
	}

	writeString(value) {
		this.writeDataView(this.encoder.encode(value||""));
	}

	writeObject(value) {
		if (value === null) {
			this.writeUnsignedByte(PayloadTypes.Null);
		} else if (typeof(value) === "number") {
			if (value % 1 !== 0) {	//	float
				this.writeUnsignedByte(PayloadTypes.Float);
				this.writeFloat(value);
			} else if (value >= 0) {	//	unsigned
				if (value <= 0xFF) {
					this.writeUnsignedByte(PayloadTypes.UnsignedByte);
					this.writeUnsignedByte(value);
				} else if (value <= 0xFFFF) {
					this.writeUnsignedByte(PayloadTypes.UnsignedShort);
					this.writeUnsignedShort(value);
				} else {
					this.writeUnsignedByte(PayloadTypes.UnsignedInt);
					this.writeUnsignedInt(value);
				}
			} else {	//	signed
				if (value >= -128) {
					this.writeUnsignedByte(PayloadTypes.Byte);
					this.writeByte(value);
				} else if (value >= -32768) {
					this.writeUnsignedByte(PayloadTypes.Short);
					this.writeByte(value);
				} else {
					this.writeUnsignedByte(PayloadTypes.Int);
					this.writeInt(value);
				}
			}
		} else if (typeof(value) === "boolean") {
			this.writeUnsignedByte(PayloadTypes.Boolean);
			this.writeByte(value ? 1 : 0);
		} else if (typeof(value) === "string") {
			this.writeUnsignedByte(PayloadTypes.String);
			this.writeString(value);
		} else if (value instanceof DataView) {
			this.writeUnsignedByte(PayloadTypes.DataView);
			this.writeDataView(value);
		} else if (Array.isArray(value)) {
			this.writeUnsignedByte(PayloadTypes.Array);
			this.writeArray(value)
		} else if (typeof(value) === "object") {	//	write an object
			this.writeUnsignedByte(PayloadTypes.Object);
			this.writeUnsignedShort(Utils.count(value));
			for (let i in value) {
				this.writeString(i);
				this.writeObject(value[i]);
			}
		} else if (typeof(value) === "undefined") {
			this.writeUnsignedByte(PayloadTypes.Undefined);
		} else {
			console.error("Unrecognized type for " + value);
		}
	}

	writeArray(value) {
		this.writeUnsignedInt(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeObject(value[i]);
		}
	}

	getPayload() {
		if (!this.byteCount) {
			return null;
		}
		const payload = this.payloadPool.get();
		payload.dataView = this.dataView;
		payload.byteCount = this.byteCount;
		return payload;
	}
}