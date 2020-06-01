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
		this.payloadProducer = new PayloadProducer();
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
		actions.forEach(({ id, parameters, apply, merge}) => {
			const ids = Array.isArray(id) ? id : [id];
			ids.forEach(_id => {
				if (_id && apply) {
					const registryEntry = {
						id: _id,
						readBuffer: this.payloadProducer.getReadBufferMethod(parameters||""),
						apply,
						writeBuffer: this.payloadProducer.getWriteBufferMethod(parameters||"", merge),
					};
					this.registry[_id] = registryEntry;				
				}
			});
		});
	}

	setup(dataView, byteCount, extra) {
		this.payloadProducer.setup(dataView, byteCount, extra);
	}

	apply() {
		const { payloadProducer } = this;
		while (payloadProducer.hasData()) {
			this.applyCommand(payloadProducer.readCommand());
		}
		payloadProducer.clear();
		for (let i = 0; i < this.onApplyListener.length; i++) {
			this.onApplyListener[i]();
		}
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
			registry[command].writeBuffer(command, params);
		} else {
			console.error(`Unknown command ${command}.`);			
		}
	}

	clear() {
		this.payloadProducer.clear();
	}
}
