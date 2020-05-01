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
	}

	handleMessage({data}) {
		switch(data.action) {
			case "response":
				console.log(data.message);
				break;
		}
	}

	ping(message) {
		this.worker.postMessage({
			action: "ping",
			message,
		});
	}

	import() {
		this.worker.postMessage({
			action: "import",
			data: this.engine.data,
		});
	}
}