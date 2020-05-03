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
	constructor(engine) {
		this.engine = engine;
		this.worker = new Worker(`generated/js/source/engine/worker/worker.js`);
		this.worker.addEventListener("message", e => this.handleMessage(e));
		this.engine.addEventListener("start", e => this.init());
	}

	handleMessage(event) {
		const {data : {action}} = event;
		switch(action) {
			case "response": {
				const {data : {message}} = event;
				console.log(data.message);
				break;
			}
			case "engine": {
				const {data : {component, command, parameters}} = event;
				this.engine[component][command](...parameters);
				break;
			}
		}
	}

	init() {
		this.worker.postMessage({
			action: "init",
			data: this.engine.data,
			localStorageData: JSON.parse(localStorage.getItem("data")),
		});		
	}

	ping(message) {
		this.worker.postMessage({
			action: "ping",
			message,
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

	setScene(name) {
		this.worker.postMessage({
			action: "setScene",
			name,
		});
	}

	sendWorkerLoop(workerPayload, workerArrayBuffers) {
		this.worker.postMessage(workerPayload, workerArrayBuffers);
	}
}