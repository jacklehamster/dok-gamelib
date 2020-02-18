class Game {
	constructor(engine, sceneManager, config, data) {
		this.engine = engine;
		this.sceneManager = sceneManager;
		this.config = config;
		this.data = data;
		this.currentScene = {};

		const self = this;
		function animationFrame(timeMillis) {
			self.refresh(timeMillis);
			requestAnimationFrame(animationFrame);
		}
		requestAnimationFrame(animationFrame);
	}

	start() {
		const { start } = this.config;
		this.setScene(this.sceneManager.scenes[start]);
		console.log("Starting scene:", start);
	}

	setScene(scene) {
		this.currentScene = scene;
		this.engine.setBackground(this.evaluate(this.currentScene.background));
	}

	evaluate(value, ...params) {
		return typeof value === "function" ? value.apply(this, params) : value;
	}

	refresh(timeMillis) {
		const { engine, currentScene } = this;
		engine.clear();
		engine.setTime(timeMillis);
		if (currentScene) {
			engine.display(currentScene.sprites);
		}
	}
}
