/**
	Engine
  */

class Engine {
	constructor(game, canvas, sceneManager, config, data) {
		this.game = game;
		this.glRenderer = new GLRenderer(canvas, data.webgl, data.generated.config.imagedata);
		this.sceneRenderer = new SceneRenderer(this.glRenderer, game);
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor(game);
		this.sceneManager = sceneManager;
		this.keyboard = new Keyboard({
			onKeyPress: key => game.evaluate(game.scene.keyboard.onKeyPress, key),
			onKeyRelease: key => game.evaluate(game.scene.keyboard.onKeyRelease, key),
			onDownPress: () => game.evaluate(game.scene.keyboard.onDownPress),
			onDownRelease: () => game.evaluate(game.scene.keyboard.onDownRelease),
			onLeftPress: () => game.evaluate(game.scene.keyboard.onLeftPress),
			onLeftRelease: () => game.evaluate(game.scene.keyboard.onLeftRelease),
			onUpPress: () => game.evaluate(game.scene.keyboard.onUpPress),
			onUpRelease: () => game.evaluate(game.scene.keyboard.onUpRelease),
			onRightPress: () => game.evaluate(game.scene.keyboard.onRightPress),
			onRightRelease: () => game.evaluate(game.scene.keyboard.onRightRelease),
			onActionPress: () => game.evaluate(game.scene.keyboard.onActionPress),
			onActionRelease: () => game.evaluate(game.scene.keyboard.onActionRelease),
		});
		this.config = config;
		this.data = data;
		this.currentScene = EMPTY_OBJECT;

		Engine.beginLooping(this);
	}

	start() {
		this.setScene(this.sceneManager.getFirstScene());
		console.log("start scene:", this.currentScene.name);
	}

	static beginLooping(engine) {
		Engine.instance = engine;
		const { glRenderer, sceneRenderer, spriteRenderer, spriteDefinitionProcessor, keyboard, game } = engine;
		function animationFrame(now) {
			const { currentScene } = engine;
			game.now = now;
			if (currentScene.keyboard) {
				game.keyboard = keyboard.getKeyboard(now);
			}
			sceneRenderer.render(currentScene);
			const sprites = spriteDefinitionProcessor.process(currentScene.sprites, now);
			glRenderer.setTime(now);
			glRenderer.clearScreen();
			glRenderer.sendSprites(sprites, now);
			glRenderer.draw();
			Pool.resetAll();
			requestAnimationFrame(animationFrame);
		}
		requestAnimationFrame(animationFrame);		
	}

	setScene(scene) {
		this.currentScene = scene;
		this.game.setScene(scene);
		this.sceneRenderer.init(scene);
		this.spriteDefinitionProcessor.init(scene.sprites);
	}
}
