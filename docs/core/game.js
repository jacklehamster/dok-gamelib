/**
	Game
  */

class Game {
	constructor(canvas, sceneManager, config, data) {
		this.engine = new Engine(canvas, data.webgl, data.generated.config.imagedata);
		this.evaluator = new Evaluator();
		this.sceneRenderer = new SceneRenderer(this.engine, this.evaluator);
		this.spriteRenderer = new SpriteRenderer(this.engine, this.evaluator);
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor(this.evaluator);
		this.sceneManager = sceneManager;
		this.config = config;
		this.data = data;
		this.currentScene = {};

		const { engine, sceneRenderer, spriteRenderer, spriteDefinitionProcessor, evaluator } = this;
		const self = this;
		function animationFrame(timeMillis) {
			const { currentScene } = self;
			engine.setTime(timeMillis);
			evaluator.timeMillis = timeMillis;
			engine.clearScreen();
			sceneRenderer.render(currentScene);
			const sprites = spriteDefinitionProcessor.process(currentScene.sprites, timeMillis);
			spriteRenderer.render(sprites, timeMillis);
			Pool.resetAll();
			requestAnimationFrame(animationFrame);
		}
		requestAnimationFrame(animationFrame);
	}

	start() {
		const { start } = this.config;
		this.setScene(this.sceneManager.scenes[start]);
		console.log("start scene:", start);
	}

	setScene(scene) {
		this.currentScene = scene;
	}
}
