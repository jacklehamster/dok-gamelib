/**
	Engine
  */

class Engine {
	constructor(game, canvas, sceneManager) {
		this.game = game;
		this.data = getData();
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.data.generated.config.imagedata);
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
		this.currentScene = EMPTY_OBJECT;

		this.validate();

		Engine.beginLooping(this);
	}

	validate() {
		this.sceneManager.validateScenes(this.game, this.data);
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
			glRenderer.setTime(now);
			glRenderer.clearScreen();
			const sprites = spriteDefinitionProcessor.process(currentScene.sprites, now);
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
