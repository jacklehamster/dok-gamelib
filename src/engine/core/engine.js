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
		this.timeScheduler = new TimeScheduler();
		this.dataStore = new DataStore(localStorage);
		this.workerManager = new WorkerManager(this, this.dataStore);
		this.mediaManager = new MediaManager(this.data.generated);
		this.domManager = new DOMManager(document);
		this.spriteRenderer = new SpriteRenderer(this);
		this.spritesheetManager = new SpritesheetManager(this.data.generated);
		this.glRenderer = new GLRenderer(canvas, this.data.webgl, this.mediaManager, this.spriteRenderer, this.spritesheetManager, this.data.generated);
		this.sceneGL = new SceneGL(canvas, this.glRenderer.gl, this.glRenderer.shader);
		this.communicator = new Communicator(this.sceneGL);
		this.sceneRefresher = new SceneRefresher();
		this.uiProvider = new SpriteProvider(() => new UISpriteInstance());
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.canvasRenderer = new CanvasRenderer(this.spriteDataProcessor, this.spritesheetManager, this.data.generated);
		this.uiRenderer = new UIRenderer(canvas, this.canvasRenderer, this.workerManager);
		this.newgrounds = new NewgroundsWrapper(this.data.generated.game.newgrounds);
		this.configProcessor = new ConfigProcessor(this.data);
		this.focusFixer = new FocusFixer(canvas);
		this.processGameInEngine = true;
		this.processSceneInEngine = true;

		if (this.processSceneInEngine) {
			this.engineCommunicator = new EngineCommunicator();
			this.sceneRenderer = new SceneRenderer(new EngineSceneRenderer(this.engineCommunicator), this.mediaManager, this.domManager);			
		}

		this.keyboard = new Keyboard(this.workerManager, document, {
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
		this.mouse = new Mouse(this.workerManager, canvas, document, {
			onMouseDown: mouseStatus => this.currentScene.mouse.onMouseDown.run(mouseStatus),
			onMouseUp: mouseStatus => this.currentScene.mouse.onMouseUp.run(mouseStatus),
			onMouseMove: mousePosition => this.currentScene.mouse.onMouseMove.run(mousePosition),			
		});

		window.addEventListener("load", () => {
			this.running = true;
		});

		if (this.processGameInEngine) {
			this.addEventListener("sceneChange", () => {
				this.sceneRefresher.init(this.currentScene);
				this.spriteDataProcessor.init(this.currentScene);
				this.spriteDefinitionProcessor.init(this.currentScene.sprites);
				this.spriteDefinitionProcessor.init(this.currentScene.ui);
			});
		}

		this.addEventListener("start", () => this.importScenes());
	}

	start() {
		this.beginLooping();
		this.onStartListener.forEach(listener => listener(this));
		this.resetScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
		this.setCurrentScene();
//		console.log("start scene:", this.currentScene.name);
	}

	isEditor() {
		const match = location.search.match(/\beditor=([a-zA-Z0-9_]+)\b/);
		return match && match[1] ? match[1] === 1 || match[1] === "true" : this.data.generated.game.editor;
	}

	importScenes() {
		const { sceneManager, dataStore, configProcessor } = this;
		sceneManager.sceneNames.forEach(sceneName => {
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor);
			this.workerManager.import(scene);
		});
	}

	setCurrentScene() {
		this.workerManager.setScene(this.currentScene.name);
	}

	beginLooping() {
		const engine = this;
		const { glRenderer, sceneRefresher, sceneRenderer, uiRenderer, spriteDefinitionProcessor, spriteProvider, uiProvider,
				keyboard, mouse, spritesToRemove, onLoopListener, spriteDataProcessor, sceneGL, timeScheduler, engineCommunicator } = engine;

		let lastRefresh = 0;

		const spriteCollector = [];
		const uiCollector = [];

		function animationFrame(time) {
			requestAnimationFrame(animationFrame);
			time = Math.round(time);
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

			keyboard.refresh(currentScene, now);
			mouse.refresh(currentScene, now);

			if (engine.processGameInEngine) {
				timeScheduler.process(now);
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

					if (sceneRenderer) {
						sceneRenderer.render(currentScene);
						engine.communicator.applyBuffer(engineCommunicator.getBuffer(), engineCommunicator.count);
						engineCommunicator.count = 0;
					}

					//	render uiComponents
					uiRenderer.render(uiComponents, now);
					uiRenderer.updateUI(now);

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

	refresh(buffer, size) {
		if (buffer) {
			const { communicator, sceneGL, sceneRenderer } = this;
			if (!sceneRenderer) {
				communicator.applyBuffer(buffer, size);
			}
		}
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
			if (this.currentScene && this.currentScene.name === sceneName) {
				this.currentScene.nextScene = null;
				return;
			}
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor);

			this.currentScene = scene;
			this.currentScene.startTime = 0;
			this.currentScene.now = 0;
			this.currentScene.setEngine(this);
			this.setCurrentScene();
			this.notifySceneChange(sceneName);
			window.game = scene;
		}
	}

	notifySceneChange(sceneName) {
		this.onSceneChangeListener.forEach(callback => callback(sceneName));
	}

	sendScore(score) {
		this.newgrounds.postScore(score);
	}

	unlockMedal(medalName) {
		this.newgrounds.unlockMedal(medalName);
	}
}
