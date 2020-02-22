class Game {
	constructor(canvas, sceneManager, config, data) {
		this.engine = new Engine(canvas, data.webgl, data.generated.config.imagedata.spritesheets);
		this.sceneManager = sceneManager;
		this.config = config;
		this.data = data;
		this.spriteProcessor = new SpriteProcessor(this, engine);
		this.spriteProvider = new SpriteProvider();
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
		const { currentScene, engine } = this;
		engine.clearScreen();
		const nowSec = engine.setTime(timeMillis);
		if (currentScene) {
			engine.display(this.spriteProcessor.process(currentScene.sprites, this.spriteProvider, nowSec));
		}
	}
}
