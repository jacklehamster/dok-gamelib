/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	Engine
  */

class WorkerEngine {
	constructor() {
		this.count = 0;
	}

	beginLooping() {
		const engine = this;
		function animationFrame(time) {
			requestAnimationFrame(animationFrame);
			engine.loop();
		}
		requestAnimationFrame(animationFrame);
	}

	loop() {
		self.postMessage({action:"response", message: this.count++})
	}
}

const workerEngine = new WorkerEngine();

self.addEventListener('message', function({data}) {
	switch(data.action) {
		case "ping":
			self.postMessage({
				action: "response",
				message: data.message,
			});
			break;
		case "loop":
			workerEngine.beginLooping();
			break;
		case "import":
			console.log(data.data);
			self.importScripts(
				'../lib/gl-matrix.js',
				'../common/constants.js',
				'../core/config-processor.js',
				'../game/components/motion-utils.js',
				'../game/components/shape-utils.js',
				'../game/components/sprite-utils.js',
				'../game/components/text-utils.js',
				'../game/base/base-definition.js',
				'../game/animation-definition.js',
				'../game/ui-definition.js',
				'../game/sprite-definition.js',
				'../game/game.js',
				"../scene-manager/scene-manager.js",
			);

			SceneManager.loadingSceneName = "dobuki";
			self.importScripts(`../../game/scenes/${SceneManager.loadingSceneName}/start.js`);

			console.log(SceneManager.instance);
			break;
	}
});