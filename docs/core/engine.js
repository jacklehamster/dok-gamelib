/**
	Engine
  */

class Engine {
	constructor(canvas, sceneManager) {
		canvas.focus();
		this.data = getData();
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.data.generated.config.imagedata);
		this.sceneRenderer = new SceneRenderer(this.glRenderer);
		this.spriteProvider = new SpriteProvider(() => new Sprite());
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

		this.spritesToRemove = [];
	}

	start() {
		Engine.beginLooping(this);
		this.setScene(this.sceneManager.getFirstSceneName());
		console.log("start scene:", this.currentScene.name);
	}

	static beginLooping(engine) {
		Engine.instance = engine;
		const { glRenderer, sceneRenderer, spriteDefinitionProcessor, spriteProvider, keyboard, spritesToRemove } = engine;
		function animationFrame(now) {
			requestAnimationFrame(animationFrame);
			const { currentScene } = engine;
			const frameDuration = 1000 / currentScene.getFrameRate();

			currentScene.now = now;
			currentScene.keys = keyboard.getKeyboard(now);
			sceneRenderer.refresh(currentScene);
			spriteDefinitionProcessor.refresh(currentScene);

			if (now - glRenderer.lastRefresh >= frameDuration) {
				glRenderer.setTime(now);
				glRenderer.clearScreen();
				sceneRenderer.render(currentScene);

				//	show sprites to process
				const sprites = spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider);
				glRenderer.sendSprites(sprites, now);

				//	remove unprocessed sprites
				spritesToRemove.length = 0;
				const hiddenSprites = spriteProvider.getSprites();
				for (let i = 0; i < hiddenSprites.length; i++) {
					const sprite = hiddenSprites[i];
					if (sprite.updated < now && !sprite.hidden) {
						sprite.setHidden(true, now);
						spritesToRemove.push(sprite);
					}
				}
				glRenderer.sendSprites(spritesToRemove);
				glRenderer.sendUpdatedBuffers(now);
				glRenderer.draw(now);
			}
			Pool.resetAll();
		}
		requestAnimationFrame(animationFrame);		
	}

	setScene(sceneName) {
		const scene = this.sceneManager.getScene(sceneName);
		if (scene) {
			window.game = scene;
			this.currentScene = scene;
			this.currentScene.engine = this;
			this.sceneRenderer.init(scene);
			this.spriteDefinitionProcessor.init(scene.sprites, scene);
		}
	}
}
