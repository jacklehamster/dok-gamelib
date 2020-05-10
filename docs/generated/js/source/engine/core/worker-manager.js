/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	WorkerManager
  */

class WorkerManager {
	constructor(engine, dataStore) {
		this.engine = engine;
		this.dataStore = dataStore;
		this.worker = new Worker(`generated/js/source/engine/worker/worker.js`);
		this.worker.addEventListener("message", e => this.handleMessage(e));
		this.engine.addEventListener("start", e => this.init());
		this.keyboardPayload = {};
		this.mousePayload = { type: "mouse" };
	}

	handleMessage(event) {
		const {data : {action}} = event;
		switch(action) {
			case "response": {
				const {data : {message}} = event;
				console.log(data.message);
				break;
			}
			case "payload": {
				const {data: { time, buffer, count, extra}} = event;
				this.engine.refresh(buffer, count, extra);
				this.returnBuffer(buffer);
				break;
			}
		}
	}

	askWorker(callback) {
		if (typeof(callback) === "function") {
			this.worker.postMessage({
				action: "askWorker",
				callback: callback.toString(),
			});
		}
	}

	returnBuffer(buffer) {
		this.worker.postMessage({
			action: "returnBuffer",
			buffer,
		}, [ buffer ]);
	}

	init() {
		this.worker.postMessage({
			action: "init",
			data: this.engine.data,
			localStorageData: this.dataStore.getData(),
		});		
	}

	ping(message) {
		this.worker.postMessage({
			action: "ping",
			message,
		});
	}

	onClickUI(id, instanceIndex) {
		this.worker.postMessage({
			action: "clickUI",
			id,
			instanceIndex,
		});		
	}

	import(game) {
		this.worker.postMessage({
			action: "import",
			name: game.name,
			data: this.engine.data,
			gameBlob: SourceCode.codeToBlob(game),
		});
	}

	gotoScene(name) {
		this.worker.postMessage({
			action: "gotoScene",
			name,
		});
	}

	onKey(type, code) {
		this.keyboardPayload.action = type;
		this.keyboardPayload.code = code;
		this.worker.postMessage(this.keyboardPayload);
	}

	onMouse(x, y, mouseDown) {
		this.mousePayload.x = x;
		this.mousePayload.y = y;
		this.mousePayload.mouseDown = mouseDown;
	}
}