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
	constructor(sceneManager, data, localStorageData) {
		this.count = 0;
		this.lastRefresh = 0;
		this.currentScene = null;
		this.data = data;
		this.onSceneChangeListener = [];
		this.sceneManager = sceneManager;
		this.sceneRefresher = new SceneRefresher();
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.uiProvider = new SpriteProvider(() => new UISpriteInstance());		
		this.configProcessor = new ConfigProcessor(this.data);
		this.mediaManager = new WorkerMediaManager(this, this.data.generated);
		this.dataStore = new WorkerDataStore(this, localStorageData);
		this.newgrounds = new WorkerNewgrounds(this);
		this.domManager = new WorkerDOMManager(this);
		this.engineCommunicator = new EngineCommunicator();
		this.timeScheduler = new TimeScheduler();
		this.engineUIRenderer = new EngineUIRenderer(this.engineCommunicator);
		this.sceneRenderer = new SceneRenderer(new EngineSceneRenderer(this.engineCommunicator), this.mediaManager, this.domManager);
		this.uiRenderer = new UIRenderer(new EngineUIRenderer(this.engineCommunicator));

		this.logger = new WorkerLogger(this);
		this.pool = {
			payloadCommands: new Pool(() => {
				return {
					component: null,
					command: null,
					parameters: [],
				};
			}, ({parameters}) => parameters.length = 0),
		};
		this.payload = {
			action: "payload",
			time: 0,
			commands: [],
		};

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
			this.logger.log("Scene change:", this.currentScene.name);
			this.postBackPayload(this.currentScene.now);
		});

		const engine = this;
		function animationFrame(time) {
			requestAnimationFrame(animationFrame);
			engine.loop(time);
		}
		requestAnimationFrame(animationFrame);		
	}

	notifySceneChange(name) {
		this.engineCommunicator.sendCommand(Commands.ENG_NOTIFY_SCENE_CHANGE, null, [name]);
	}

	loop(timeMillis) {
		const { currentScene, sceneRefresher, spriteDataProcessor, spriteDefinitionProcessor,
			uiProvider, spriteProvider, sceneRenderer, keyboard, mouse, engineCommunicator, uiRenderer } = this;
		if (!currentScene) {
			return;
		}
		const time = Math.round(timeMillis);
		if (!currentScene.startTime) {
			currentScene.startTime = time;
			return;
		}
		const now = time - currentScene.startTime;
		currentScene.now = now;

		keyboard.refresh(currentScene, now);
		mouse.refresh(currentScene, now);

		sceneRefresher.refresh(currentScene);
		spriteDataProcessor.refresh(currentScene);
		spriteDefinitionProcessor.refresh(currentScene.ui, now);
		spriteDefinitionProcessor.refresh(currentScene.sprites, now);

		const frameDuration = 1000 / currentScene.getFrameRate();

		const spriteCollector = [], uiCollector = [];

		if (time - this.lastRefresh >= frameDuration) {
			const shouldResetScene = this.currentScene.nextScene;
			this.lastRefresh = now;

			spriteDataProcessor.process(currentScene);

			//	process UI
			const uiComponents = shouldResetScene ? spriteDefinitionProcessor.ignore() : spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider, uiCollector);

			//	show sprites to process
			const sprites = shouldResetScene ? spriteDefinitionProcessor.ignore() : spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider, spriteCollector);

			sceneRenderer.render(currentScene);
			uiRenderer.render(uiComponents, now);

			this.postBackPayload(now);
			// glRenderer.setTime(now);
			// glRenderer.clearScreen();

			//	render uiComponents
			// glRenderer.sendSprites(sprites, now);

			//	update video textures
			// glRenderer.updatePlayingVideos(sprites, now);

			//	remove unprocessed sprites
			// if (shouldResetScene) {
			// 	spriteProvider.getSprites().forEach(sprite => sprite.updated = 0);
			// }
			// spritesToRemove.length = 0;
			// const hiddenSprites = spriteProvider.getSprites();
			// for (let i = 0; i < hiddenSprites.length; i++) {
			// 	const sprite = hiddenSprites[i];
			// 	if (sprite.updated < now && !sprite.hidden) {
			// 		sprite.setHidden(true, now);
			// 		spritesToRemove.push(sprite);
			// 	}
			// }
			// glRenderer.sendSprites(spritesToRemove, now);

			//	draw
			// glRenderer.draw(now);

			// for (let i = 0; i < onLoopListener.length; i++) {
			// 	onLoopListener[i](now);
			// }

			//	resetpool
			if (shouldResetScene) {
				this.resetScene(this.currentScene.nextScene);
			}

			// glRenderer.resetPools();
			this.pool.payloadCommands.reset();
		}
	}

	sendCommand(component, command, ...parameters) {
		console.log(">", component, command);
		const payloadCommand = this.pool.payloadCommands.get();
		payloadCommand.component = component;
		payloadCommand.command = command;
		payloadCommand.parameters.length = parameters.length;
		for (let i = 0; i < parameters.length; i++) {
			payloadCommand.parameters[i] = parameters[i];
		}
		this.payload.commands.push(payloadCommand);
	}

	postBackPayload(now) {
		const { payload, engineCommunicator } = this;
		payload.time = now;
		if (engineCommunicator.count && engineCommunicator.getBuffer().byteLength) {
			payload.buffer = engineCommunicator.getBuffer();
			payload.count = engineCommunicator.getCount();
			payload.extra = engineCommunicator.getExtra();
			self.postMessage(payload, [payload.buffer]);
			engineCommunicator.clear();
		} else if (payload.commands.length) {
			delete payload.buffer;
			delete payload.count;
			delete payload.extra;
			self.postMessage(payload);
		}
		payload.commands.length = 0;
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
//		this.uiRenderer.destroy();
		this.uiProvider.clear();
		this.spriteProvider.clear();
		this.uiRenderer.clear();
	}

	gotoScene(sceneName) {
		this.currentScene.gotoScene(sceneName);
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
