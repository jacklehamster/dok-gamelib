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
	constructor() {
		this.registry = [];
		this.payload = new Payload();
		this.onApplyListener = [];
	}

	getListeners(type) {
		switch(type) {
			case "apply":
				return this.onApplyListener;
		}
	}

	addEventListener(type, callback) {
		const listener = this.getListeners(type);
		listener.push(callback);
	}

	removeEventListener(type, callback) {
		const listener = this.getListeners(type);
		const index = listener.indexOf(callback);
		listener.splice(index, 1);
	}

	register(... actions) {
		actions.forEach(({ id, parameters, apply}) => {
			const ids = Array.isArray(id) ? id : [id];
			ids.forEach(_id => {
				if (_id && apply) {
					this.registry[_id] = {
						id: _id,
						readBuffer: this.payload.getReadBufferMethod(parameters||""),
						apply,
						writeBuffer: this.payload.getWriteBufferMethod(parameters||""),
					};
				}
			});
		});
	}

	setup(dataView, byteCount, extra) {
		this.payload.setup(dataView, byteCount, extra);
	}

	apply() {
		const { payload } = this;
		while (payload.hasData()) {
			this.applyCommand(payload.readCommand());
		}
		this.payload.clear();
		this.onApplyListener.forEach(callback => callback());
	}

	applyCommand(command) {
		const { registry } = this;
		if (registry[command]) {
			const { readBuffer, apply } = registry[command];
			apply(...readBuffer());
		} else {
			console.error(`Unknown command ${command}.`);
		}
	}

	sendCommand(command, ...params) {
		const { registry } = this;
		if (registry[command]) {
			this.payload.writeCommand(command);
			registry[command].writeBuffer(...params);
		} else {
			console.error(`Unknown command ${command}.`);			
		}
	}

	retrievePayload(payload) {
		return this.payload.retrievePayload(payload);
	}
}
