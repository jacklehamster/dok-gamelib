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
		this.worker = new Worker(`generated/js/source/worker/worker.js`);
		this.worker.addEventListener("message", e => this.handleMessage(e));
		this.engine.addEventListener("start", e => this.init());
		this.keyboardPayload = {};
		this.mousePayload = { type: "mouse" };
		this.callbackIds = {};
		this.nextCallbackId = 0;
	}

	terminate() {
		this.worker.terminate();
	}

	handleMessage(event) {
		const data = event.data;
		switch(data.action) {
			case "response": {
				console.log(data.message);
				break;
			}
			case "payload": {
				this.engine.refresh(data);
				if (data.dataView) {
					this.returnBuffer(data.dataView);
				}
				break;
			}
			case "beautifyCode": {
				const { callbackId, code } = data;
				const callback = this.callbackIds[callbackId];
				delete this.callbackIds[callbackId];
				callback(code);
				break;
			}
		}
	}

	beautifyCode(code, callback) {
		const callbackId = this.nextCallbackId++;
		this.callbackIds[callbackId] = callback;		
		this.worker.postMessage({
			action: "beautifyCode",
			callbackId,
			code,
		});
	}

	askWorker(callback) {
		if (typeof(callback) === "function") {
			this.worker.postMessage({
				action: "askWorker",
				callback: callback.toString(),
			});
		}
	}

	returnBuffer(dataView) {
		this.worker.postMessage({
			action: "returnBuffer",
			dataView,
		}, [ dataView.buffer ]);
	}

	init() {
		this.worker.postMessage({
			action: "init",
			data: this.engine.data,
			localStorageData: this.dataStore.getData(),
			pathname: location.pathname,
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
			gameBlob: EditorUtils.codeToBlob(game),
		});
	}

	gotoScene(name) {
		this.worker.postMessage({
			action: "gotoScene",
			name,
		});
	}

	updateVideoDimension(src, rect) {
		this.worker.postMessage({
			action: "videoDimension",
			src,
			rect,
		});
	}

	onVisibilityChange(hidden) {
		this.worker.postMessage({
			action: "visibilitychange",
			hidden,
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