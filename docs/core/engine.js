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

class Engine {
	constructor(canvas, sceneManager) {
		canvas.focus();
		this.canvas = canvas;
		this.data = getData();
		this.dataStore = new DataStore();
		this.videoManager = new VideoManager(this.data.generated);
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.videoManager, this.data.generated);
		this.sceneRenderer = new SceneRenderer(this.glRenderer);
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.sceneManager = sceneManager;
		this.keyboard = new Keyboard({
			onKeyPress: key => this.currentScene.keyboard.onKeyPress.run(key),
			onKeyRelease: key => this.currentScene.keyboard.onKeyRelease.run(key),
			onDownPress: () => this.currentScene.keyboard.onDownPress.run(),
			onDownRelease: () => this.currentScene.keyboard.onDownRelease.run(),
			onLeftPress: () => this.currentScene.keyboard.onLeftPress.run(),
			onLeftRelease: () => this.currentScene.keyboard.onLeftRelease.run(),
			onUpPress: () => this.currentScene.keyboard.onUpPress.run(),
			onUpRelease: () => this.currentScene.keyboard.onUpRelease.run(),
			onRightPress: () => this.currentScene.keyboard.onRightPress.run(),
			onRightRelease: () => this.currentScene.keyboard.onRightRelease.run(),
			onActionPress: () => this.currentScene.keyboard.onActionPress.run(),
			onActionRelease: () => this.currentScene.keyboard.onActionRelease.run(),
			onTurnLeftPress: () => this.currentScene.keyboard.onTurnLeftPress.run(),
			onTurnLeftRelease: () => this.currentScene.keyboard.onTurnLeftRelease.run(),
			onTurnRightPress: () => this.currentScene.keyboard.onTurnRightPress.run(),
			onTurnRightRelease: () => this.currentScene.keyboard.onTurnRightRelease.run(),
		});
		this.currentScene = null;
		this.spritesToRemove = [];
		this.onSceneChangeListener = [];
		this.onLoopListener = [];
		this.onStartListener = [];
	}

	start() {
		Engine.beginLooping(this);
		this.onStartListener.forEach(listener => listener(this));
		this.resetScene(this.sceneManager.getFirstSceneName());
//		console.log("start scene:", this.currentScene.name);
	}

	static beginLooping(engine) {
		const { glRenderer, sceneRenderer, spriteDefinitionProcessor, spriteProvider, keyboard, spritesToRemove, onLoopListener } = engine;
		function animationFrame(now) {
			requestAnimationFrame(animationFrame);
			const { currentScene } = engine;
			const frameDuration = 1000 / currentScene.getFrameRate();
			if (!currentScene.startTime) {
				currentScene.startTime = now;
			}
			currentScene.now = now;
			sceneRenderer.refresh(currentScene);
			spriteDefinitionProcessor.refresh(currentScene);

			if (now - glRenderer.lastRefresh >= frameDuration) {
				glRenderer.setTime(now - currentScene.startTime);
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
				onLoopListener.forEach(callback => callback(now));
				glRenderer.resetPools();
			}
		}
		requestAnimationFrame(animationFrame);		
	}

	getListeners(type) {
		switch(type) {
			case "sceneChange":
				return this.onSceneChangeListener;
			case "loop":
				return this.onLoopListener;
			case "start":
				return this.onStartListener;
		}
	}

	addEventListener(type, callback) {
		const listener = this.getListeners(type);
		listener.push(callback);
	}

	removeEventListener(type, callback) {
		const listener = this.getListeners(type);
		const index = listener.indexOf(callback);
		listener.splice(index, 1);
	}

	clearScene() {
		if (this.currentScene) {
			this.currentScene.destroy.run();
			this.currentScene.sprites.forEach(sprite => sprite.destroy.run());
		}
		this.spriteProvider.clear();
	}

	resetScene(sceneName) {
		const { sceneManager, dataStore } = this;
		if (sceneManager.hasScene(sceneName)) {
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore);

			this.currentScene = scene;
			this.currentScene.startTime = 0;
			this.currentScene.now = 0;
			this.currentScene.setEngine(this);
			this.sceneRenderer.init(scene);
			this.spriteDefinitionProcessor.init(scene.sprites, scene);
			this.onSceneChangeListener.forEach(callback => callback({name:sceneName, scene, config: scene.config}));
			window.game = scene;
		}
	}
}
