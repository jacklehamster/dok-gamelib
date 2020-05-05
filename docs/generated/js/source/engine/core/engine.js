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
	constructor(canvas, sceneManager, data) {
		canvas.focus();
		this.canvas = canvas;
		this.sceneManager = sceneManager;
		this.data = data;
		this.currentScene = null;
		this.spritesToRemove = [];
		this.onSceneChangeListener = [];
		this.onLoopListener = [];
		this.onStartListener = [];
		this.running = false;
		this.logger = new Logger();
		this.workerManager = new WorkerManager(this);
		this.dataStore = new DataStore(localStorage);
		this.mediaManager = new MediaManager(this.data.generated);
		this.spriteRenderer = new SpriteRenderer(this);
		this.spritesheetManager = new SpritesheetManager(this.data.generated);
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.mediaManager, this.spriteRenderer, this.spritesheetManager, this.data.generated);
		this.sceneRefresher = new SceneRefresher();
		this.sceneRenderer = new SceneRenderer(this.glRenderer, this.mediaManager, document);
		this.uiProvider = new SpriteProvider(() => new UISpriteInstance());
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.canvasRenderer = new CanvasRenderer(this.spriteDataProcessor, this.spritesheetManager, this.data.generated);
		this.uiRenderer = new UIRenderer(canvas, this.canvasRenderer);
		this.newgrounds = new NewgroundsWrapper(this.data.generated.game.newgrounds);
		this.configProcessor = new ConfigProcessor(this.data);
		this.focusFixer = new FocusFixer(canvas);
		this.processGameInEngine = true;

		this.keyboard = new Keyboard(document, {
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
		this.mouse = new Mouse(canvas, {
			onMouseDown: mouseStatus => this.currentScene.mouse.onMouseDown.run(mouseStatus),
			onMouseUp: mouseStatus => this.currentScene.mouse.onMouseUp.run(mouseStatus),
			onMouseMove: mousePosition => this.currentScene.mouse.onMouseMove.run(mousePosition),			
		});

		window.addEventListener("load", () => {
			this.running = true;
		});

		this.addEventListener("sceneChange", () => {
			this.sceneRefresher.init(this.currentScene);
			this.spriteDataProcessor.init(this.currentScene);
			this.spriteDefinitionProcessor.init(this.currentScene.sprites);
			this.spriteDefinitionProcessor.init(this.currentScene.ui);
			this.importAndPlayCurrentScene();			
		});
	}

	start() {
		this.beginLooping();
		this.onStartListener.forEach(listener => listener(this));
		this.resetScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
//		console.log("start scene:", this.currentScene.name);
	}

	isEditor() {
		const match = location.search.match(/\beditor=([a-zA-Z0-9_]+)\b/);
		return match && match[1] ? match[1] === 1 || match[1] === "true" : this.data.generated.game.editor;
	}

	importAndPlayCurrentScene() {
		this.workerManager.import(this.currentScene);
		this.workerManager.setScene(this.currentScene.name);
	}

	beginLooping() {
		const engine = this;
		const { glRenderer, sceneRefresher, sceneRenderer, uiRenderer, spriteDefinitionProcessor, spriteProvider, uiProvider,
				keyboard, mouse, spritesToRemove, onLoopListener, spriteDataProcessor } = engine;

		const workerPayload = {
			action: "payload",
			time: 0,
		}, workerArrayBuffers = [];
		let lastRefresh = 0;

		const spriteCollector = [];
		const uiCollector = [];

		function animationFrame(time) {
			time = Math.round(time);
			requestAnimationFrame(animationFrame);
			const { currentScene, running } = engine;
			if (!running || !currentScene) {
				return;
			}
			if (!currentScene.startTime) {
				currentScene.startTime = time;
				return;
			}
			const now = time - currentScene.startTime;
			currentScene.now = now;

			//	forward info to worker
			workerPayload.time = time;
			if (keyboard.dirty) {
				workerPayload.keysUp = keyboard.keysUp;
				workerPayload.keysDown = keyboard.keysDown;
			} else if (workerPayload.keysUp || workerPayload.keysDown) {
				delete workerPayload.keysUp;
				delete workerPayload.keysDown;
			}
			engine.workerManager.sendWorkerLoop(workerPayload, workerArrayBuffers);
			workerArrayBuffers.length = 0;

			if (keyboard.dirty) {
				currentScene.keys;
			}
			if (mouse.dirty) {
				currentScene.mouseStatus;
			}

			if (engine.processGameInEngine) {
				sceneRefresher.refresh(currentScene);
				spriteDataProcessor.refresh(currentScene);
				spriteDefinitionProcessor.refresh(currentScene.ui, now);
				spriteDefinitionProcessor.refresh(currentScene.sprites, now);

				const frameDuration = 1000 / currentScene.getFrameRate();
				if (time - lastRefresh >= frameDuration) {
					const shouldResetScene = currentScene.nextScene;
					lastRefresh = now;

					spriteDataProcessor.process(currentScene);

					//	process UI
					const uiComponents = shouldResetScene ? spriteDefinitionProcessor.ignore() : spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider, uiCollector);

					//	show sprites to process
					const sprites = shouldResetScene ? spriteDefinitionProcessor.ignore() : spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider, spriteCollector);

					glRenderer.setTime(now);
					glRenderer.clearScreen();

					//	render uiComponents
					sceneRenderer.render(currentScene);
					uiRenderer.render(uiComponents, now);
					glRenderer.sendSprites(sprites, now);

					//	update video textures
					glRenderer.updatePlayingVideos(sprites, now);

					//	remove unprocessed sprites
					if (shouldResetScene) {
						spriteProvider.getSprites().forEach(sprite => sprite.updated = 0);
					}
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

					//	draw
					glRenderer.draw(now);

					for (let i = 0; i < onLoopListener.length; i++) {
						onLoopListener[i](now);
					}

					//	resetpool
					if (shouldResetScene) {
						engine.resetScene(currentScene.nextScene);
					}
					glRenderer.resetPools();
				}
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
		if (this.processGameInEngine) {
			this.currentScene.gotoScene(sceneName);
		}
		this.workerManager.gotoScene(sceneName);
	}

	resetScene(sceneName) {
		const { sceneManager, dataStore, configProcessor } = this;
		if (sceneManager.hasScene(sceneName)) {
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor);

			this.currentScene = scene;
			this.currentScene.startTime = 0;
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
