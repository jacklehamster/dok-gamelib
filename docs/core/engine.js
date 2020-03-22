/**
	Engine
  */

class Engine {
	constructor(canvas, sceneManager) {
		canvas.focus();
		this.data = getData();
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.data.generated.config.imagedata);
		this.sceneRenderer = new SceneRenderer(this.glRenderer);
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.sceneManager = sceneManager;
		this.keyboard = new Keyboard({
			onKeyPress: key => this.currentScene.keyboard.onKeyPress.get(key),
			onKeyRelease: key => this.currentScene.keyboard.onKeyRelease.get(key),
			onDownPress: () => this.currentScene.keyboard.onDownPress.get(),
			onDownRelease: () => this.currentScene.keyboard.onDownRelease.get(),
			onLeftPress: () => this.currentScene.keyboard.onLeftPress.get(),
			onLeftRelease: () => this.currentScene.keyboard.onLeftRelease.get(),
			onUpPress: () => this.currentScene.keyboard.onUpPress.get(),
			onUpRelease: () => this.currentScene.keyboard.onUpRelease.get(),
			onRightPress: () => this.currentScene.keyboard.onRightPress.get(),
			onRightRelease: () => this.currentScene.keyboard.onRightRelease.get(),
			onActionPress: () => this.currentScene.keyboard.onActionPress.get(),
			onActionRelease: () => this.currentScene.keyboard.onActionRelease.get(),
		});
		this.currentScene = EMPTY_OBJECT;

		this.spritesToRemove = [];
	}

	start() {
		Engine.beginLooping(this);
		this.resetScene(this.sceneManager.getFirstSceneName());
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
				glRenderer.sendSprites(spritesToRemove, now);
				glRenderer.sendUpdatedBuffers(now);
				glRenderer.draw(now);
			}
			Pool.resetAll();
		}
		requestAnimationFrame(animationFrame);		
	}

	resetScene(sceneName) {
		const scene = this.sceneManager.createScene(sceneName);
		if (scene) {
			const now = this.currentScene ? this.currentScene.now : 0;
			const keys = this.currentScene ? this.currentScene.keys : {};

			window.game = scene;
			this.currentScene = scene;
			this.currentScene.now = now;
			this.currentScene.keys = keys;
			this.currentScene.engine = this;
			this.sceneRenderer.init(scene);
			this.spriteDefinitionProcessor.init(scene.sprites, scene);
		}
	}
}
