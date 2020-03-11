/**
	Engine
  */

class Engine {
	constructor(canvas, sceneManager) {
		canvas.focus();
		this.data = getData();
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.data.generated.config.imagedata);
		this.sceneRenderer = new SceneRenderer(this.glRenderer);
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.sceneManager = sceneManager;
		this.keyboard = new Keyboard({
			onKeyPress: key => this.currentScene.evaluate(this.currentScene.keyboard.onKeyPress, key),
			onKeyRelease: key => this.currentScene.evaluate(this.currentScene.keyboard.onKeyRelease, key),
			onDownPress: () => this.currentScene.evaluate(this.currentScene.keyboard.onDownPress),
			onDownRelease: () => this.currentScene.evaluate(this.currentScene.keyboard.onDownRelease),
			onLeftPress: () => this.currentScene.evaluate(this.currentScene.keyboard.onLeftPress),
			onLeftRelease: () => this.currentScene.evaluate(this.currentScene.keyboard.onLeftRelease),
			onUpPress: () => this.currentScene.evaluate(this.currentScene.keyboard.onUpPress),
			onUpRelease: () => this.currentScene.evaluate(this.currentScene.keyboard.onUpRelease),
			onRightPress: () => this.currentScene.evaluate(this.currentScene.keyboard.onRightPress),
			onRightRelease: () => this.currentScene.evaluate(this.currentScene.keyboard.onRightRelease),
			onActionPress: () => this.currentScene.evaluate(this.currentScene.keyboard.onActionPress),
			onActionRelease: () => this.currentScene.evaluate(this.currentScene.keyboard.onActionRelease),
		});
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
			currentScene.now = now;
			currentScene.keys = keyboard.getKeyboard(now);
			sceneRenderer.render(currentScene);
			glRenderer.setTime(now);
			glRenderer.clearScreen();
			const sprites = spriteDefinitionProcessor.process(currentScene.sprites, currentScene);
			glRenderer.sendSprites(sprites, now);
			glRenderer.draw();
			Pool.resetAll();
			requestAnimationFrame(animationFrame);
		}
		requestAnimationFrame(animationFrame);		
	}

	setScene(scene) {
		window.game = scene;
		this.currentScene = scene;
		this.sceneRenderer.init(scene);
		this.spriteDefinitionProcessor.init(scene.sprites, scene);
	}
}
