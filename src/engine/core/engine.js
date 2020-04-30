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
		this.mediaManager = new MediaManager(this.data.generated);
		this.spriteRenderer = new SpriteRenderer(this);
		this.spritesheetManager = new SpritesheetManager(this.data.generated);
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.mediaManager, this.spriteRenderer, this.spritesheetManager, this.data.generated);
		this.sceneRenderer = new SceneRenderer(this.glRenderer, this.mediaManager);
		this.uiProvider = new SpriteProvider(now => new UISpriteInstance(now));
		this.spriteProvider = new SpriteProvider(now => new SpriteInstance(now));
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.canvasRenderer = new CanvasRenderer(this.spriteDataProcessor, this.spritesheetManager, this.data.generated);
		this.uiRenderer = new UIRenderer(canvas, this.canvasRenderer);
		this.newgrounds = new NewgroundsWrapper(this.data.generated.game.newgrounds);
		this.sceneManager = sceneManager;
		this.keyboard = new Keyboard(this, {
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
		this.mouse = new Mouse(this, {
			onMouseDown: mouseStatus => this.currentScene.mouse.onMouseDown.run(mouseStatus),
			onMouseUp: mouseStatus => this.currentScene.mouse.onMouseUp.run(mouseStatus),
			onMouseMove: mousePosition => this.currentScene.mouse.onMouseMove.run(mousePosition),			
		});
		this.currentScene = null;
		this.spritesToRemove = [];
		this.onSceneChangeListener = [];
		this.onLoopListener = [];
		this.onStartListener = [];
		this.running = false;

		window.addEventListener("load", () => {
			this.running = true;
		});

		this.addEventListener("sceneChange", () => {
			this.glRenderer.init();
			this.sceneRenderer.init(this.currentScene);
			this.spriteDataProcessor.init(this.currentScene);
			this.spriteDefinitionProcessor.init(this.currentScene.sprites);
			this.spriteDefinitionProcessor.init(this.currentScene.ui);
		});
	}

	start() {
		Engine.beginLooping(this);
		this.onStartListener.forEach(listener => listener(this));
		this.resetScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
//		console.log("start scene:", this.currentScene.name);
	}

	isEditor() {
		const match = location.search.match(/\beditor=([a-zA-Z0-9_]+)\b/);
		return match && match[1] ? match[1] === 1 || match[1] === "true" : this.data.generated.game.editor;
	}

	static beginLooping(engine) {
		const { glRenderer, sceneRenderer, uiRenderer, spriteDefinitionProcessor, spriteProvider, uiProvider,
				keyboard, mouse, spritesToRemove, onLoopListener, spriteDataProcessor } = engine;

		let lastRefresh = 0;
		function animationFrame(now) {
			requestAnimationFrame(animationFrame);
			const { currentScene, running } = engine;
			if (!running || !currentScene) {
				return;
			}
			const frameDuration = 1000 / currentScene.getFrameRate();
			currentScene.now = now;

			if (keyboard.dirty) {
				currentScene.keys;
			}
			if (mouse.dirty) {
				currentScene.mouseStatus;
			}

			sceneRenderer.refresh(currentScene);
			spriteDataProcessor.refresh(currentScene);
			spriteDefinitionProcessor.refresh(currentScene.ui, currentScene.now);
			spriteDefinitionProcessor.refresh(currentScene.sprites, currentScene.now);

			if (engine.nextScene) {
				engine.resetScene(engine.nextScene);
				return;
			}

			if (now - lastRefresh >= frameDuration) {
				lastRefresh = now;
				glRenderer.setTime(now);
				glRenderer.clearScreen();

				sceneRenderer.render(currentScene);

				spriteDataProcessor.process(currentScene);

				//	process UI
				const uiComponents = spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider);
				//	render uiComponents
				uiRenderer.render(uiComponents, now);

				//	show sprites to process
				const sprites = spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider);
				glRenderer.sendSprites(sprites, now);

				//	update video textures
				glRenderer.updatePlayingVideos(sprites, now);

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
				for (let i = 0; i < onLoopListener.length; i++) {
					onLoopListener[i](now);
				}
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
			this.spriteDefinitionProcessor.destroy(this.currentScene.ui);
			this.spriteDefinitionProcessor.destroy(this.currentScene.sprites);
			this.spriteDataProcessor.destroy(this.currentScene);
			this.currentScene.destroy.run();
		}
		this.uiRenderer.destroy();
		this.uiProvider.clear();
		this.spriteProvider.clear();
	}

	gotoScene(sceneName) {
		this.nextScene = sceneName;
	}

	resetScene(sceneName) {
		this.nextScene = null;
		const { sceneManager, dataStore } = this;
		if (sceneManager.hasScene(sceneName)) {
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore);

			this.currentScene = scene;
			this.currentScene.now = 0;
			this.currentScene.setEngine(this);
			this.onSceneChangeListener.forEach(callback => callback({name:sceneName, scene, config: scene.config}));
			window.game = scene;
		}
	}

	sendScore(score) {
		this.newgrounds.postScore(score);
	}

	unlockMedal(medalName) {
		this.newgrounds.unlockMedal(medalName);
	}
}
