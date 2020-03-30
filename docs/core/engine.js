/**
	Engine
  */

class Engine {
	constructor(canvas, sceneManager) {
		canvas.focus();
		this.data = getData();
		this.dataStore = new DataStore();
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.data.generated.config);
		this.sceneRenderer = new SceneRenderer(this.glRenderer);
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.videoManager = new VideoManager(this.data.generated.config);
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
		this.currentScene = null;
		this.spritesToRemove = [];
		this.onSceneChangeListener = [];
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

	addOnSceneChangeListener(callback) {
		this.onSceneChangeListener.push(callback);
	}

	removeOnSceneChangeListener(callback) {
		const index = this.onSceneChangeListener.indexOf(callback);
		this.onSceneChangeListener.splice(index, 1);
	}

	resetScene(sceneName) {
		const scene = this.sceneManager.createScene(sceneName, this.dataStore);
		if (scene) {
			if (this.currentScene) {
				this.currentScene.destroy.run();
				this.currentScene.sprites.forEach(sprite => sprite.destroy.run());
			}
			const now = this.currentScene ? this.currentScene.now : 0;
			const keys = this.currentScene ? this.currentScene.keys : {};

			window.game = scene;
			this.currentScene = scene;
			this.currentScene.now = now;
			this.currentScene.keys = keys;
			this.currentScene.setEngine(this);
			this.sceneRenderer.init(scene);
			this.spriteDefinitionProcessor.init(scene.sprites, scene);
			this.onSceneChangeListener.forEach(callback => callback(sceneName));
		}
	}
}
