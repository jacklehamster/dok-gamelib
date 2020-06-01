/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	WorkerEngine
 */

class WorkerEngine {
	constructor(sceneManager, { pathname, data, localStorageData, mouse, keyboard, textureManager, communicator, uiRenderer, windowStatus}) {
		this.count = 0;
		this.lastRefresh = 0;
		this.currentScene = null;
		this.data = data;
		this.keyboard = keyboard;
		this.mouse = mouse;
		this.windowStatus = windowStatus;
		this.textureManager = textureManager;
		this.onSceneChangeListener = [];
		this.sceneManager = sceneManager;
		this.socket = new Socket(pathname);
		this.communicator = communicator;
		configCommunicator(this.communicator);

		this.sceneRefresher = new SceneRefresher();
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.uiProvider = new SpriteProvider(() => new UISpriteInstance());		
		this.configProcessor = new ConfigProcessor(this.data);
		this.mediaManager = new WorkerMediaManager(this.communicator, this.data.generated);
		this.dataStore = new WorkerDataStore(this.communicator, localStorageData);
		this.newgrounds = new WorkerNewgrounds(this.communicator);
		this.domManager = new WorkerDOMManager(this.communicator);
		this.sceneRenderer = new SceneRenderer(new EngineSceneRenderer(this.communicator), this.mediaManager, this.domManager, this.socket);
		this.uiRenderer = uiRenderer;
		this.glRenderer = new WorkerSpriteRenderer(this.textureManager, this.communicator, this.spriteProvider, this.spriteDataProcessor, this.data.generated);
		this.logger = new WorkerLogger(this.communicator);
		this.timeScheduler = new TimeScheduler();
		this.pauseTime = 0;


		this.keyboard = new Keyboard(null, null, {
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

		this.mouse = new Mouse(null, null, null, {
			onMouseDown: mouseStatus => this.currentScene.mouse.onMouseDown.run(mouseStatus),
			onMouseUp: mouseStatus => this.currentScene.mouse.onMouseUp.run(mouseStatus),
			onMouseMove: mousePosition => this.currentScene.mouse.onMouseMove.run(mousePosition),			
		});


		this.addEventListener("sceneChange", () => {
			this.sceneRefresher.init(this.currentScene);
			this.spriteDataProcessor.init(this.currentScene);
			this.spriteDefinitionProcessor.init(this.currentScene.sprites);
			this.spriteDefinitionProcessor.init(this.currentScene.ui);
			this.notifySceneChange(this.currentScene.name);
			this.currentScene.saveData();
			this.logger.log("Scene change:", this.currentScene.name);
			this.postBackPayload(this.currentScene.now);
		});

		this.socket.addEventListener("update", (id, data) => {
			if (this.windowStatus.hidden) {
				this.setPaused(false);
				this.lastUpdateTime = Date.now();
			}
		});

		this.payload = {
			action: "payload",
			time: 0,
		};
		this.emptyPayload = {
			action: "payload",
			time: 0,
		};

		this.spriteCollector = [];
		this.uiCollector = [];

		this.lastUpdateTime = 0;
		this.refreshId = 0;
		this.interval = 0;
		this.setPaused(false);
	}

	isPaused() {
		return !this.refreshId && !this.interval;
	}

	setPaused(paused) {
		if (paused) {
			if (this.refreshId) {
				cancelAnimationFrame(this.refreshId);
				this.refreshId = 0;
			}
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = 0;
			}
		} else {
			if (typeof(requestAnimationFrame) !== 'undefined') {
				if (!this.refreshId) {
					const engine = this;
					function animationFrame(time) {
						engine.loop(time);
						engine.refreshId = requestAnimationFrame(animationFrame);
					}
					this.refreshId = requestAnimationFrame(animationFrame);
				}
			} else {
				if (!this.interval) {
					this.interval = setInterval(() => {
						this.loop(Date.now());
					}, 16);
				}
			}
		}
	}

	notifySceneChange(name) {
		this.communicator.sendCommand(Commands.ENG_NOTIFY_SCENE_CHANGE, name);
	}

	loop(timeMillis) {
		const { currentScene, sceneRefresher, spriteDataProcessor, spriteDefinitionProcessor, mediaManager, timeScheduler,
			uiProvider, spriteProvider, sceneRenderer, keyboard, mouse, uiRenderer, glRenderer, windowStatus: { hidden },
			uiCollector, spriteCollector } = this;
		if (!currentScene || (hidden && Date.now() - this.lastUpdateTime > 1000)) {
			if (!this.pauseTime) {
				this.pauseTime = Math.round(timeMillis);
			}
			this.setPaused(true);
			return;
		}
		const time = Math.round(timeMillis);
		if (!currentScene.startTime) {
			currentScene.startTime = time;
			return;
		}
		if (this.pauseTime) {
			const diff = time - this.pauseTime;
			currentScene.startTime += diff;
			this.pauseTime = 0;
		}

		const now = time - currentScene.startTime;
		currentScene.now = now;

		keyboard.refresh(currentScene, now);
		mouse.refresh(currentScene, now);

		timeScheduler.process(now);
		sceneRefresher.refresh(currentScene);
		spriteDataProcessor.refresh(currentScene);
		spriteDefinitionProcessor.refresh(currentScene.ui, now);
		spriteDefinitionProcessor.refresh(currentScene.sprites, now);

		const frameDuration = 1000 / currentScene.getFrameRate();

		if (time - this.lastRefresh >= frameDuration) {
			const shouldResetScene = currentScene.nextScene;
			this.lastRefresh = now;

			spriteDataProcessor.process(currentScene);

			//	process UI
			uiCollector.length = 0;
			const uiComponents = shouldResetScene ? EMPTY_ARRAY : spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider, uiCollector);

			//	show sprites to process
			spriteCollector.length = 0;
			const sprites = shouldResetScene ? EMPTY_ARRAY : spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider, spriteCollector);

			sceneRenderer.render(currentScene);
			uiRenderer.render(uiComponents, now);
			mediaManager.updatePlayingVideos(sprites, now);
			glRenderer.sendSprites(sprites, now);
			this.postBackPayload(now);

			//	resetpool
			if (shouldResetScene) {
				this.resetScene(this.currentScene.nextScene);
			}
		}
	}

	postBackPayload(now) {
		const payload = this.communicator.payloadProducer.getPayload();
		if (payload) {
			this.payload.time = now;
			this.payload.payload = payload;
			self.postMessage(this.payload, [payload.dataView.buffer]);
			this.communicator.clear();
		} else {
			this.emptyPayload.time = now;
			self.postMessage(this.emptyPayload);
		}
	}

	getListeners(type) {
		switch(type) {
			case "sceneChange":
				return this.onSceneChangeListener;
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
		this.socket.clear();
		this.uiProvider.clear();
		this.spriteProvider.clear();
		this.uiRenderer.clear();
		this.glRenderer.clear();
	}

	gotoScene(sceneName) {
		if (this.currentScene) {
			this.currentScene.gotoScene(sceneName);
		} else {
			this.resetScene(sceneName);
		}
	}

	resetScene(sceneName) {
		const { sceneManager, dataStore, configProcessor } = this;
		if (sceneManager.hasScene(sceneName)) {
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor, this);
			this.currentScene = scene;
			this.currentScene.startTime = 0;
			this.currentScene.now = 0;
			this.currentScene.data.lastScene = sceneName;
			this.onSceneChangeListener.forEach(callback => callback(sceneName));
		}
	}

	sendScore(score) {
		this.newgrounds.postScore(score);
	}

	unlockMedal(medalName) {
		this.newgrounds.unlockMedal(medalName);
	}
}
