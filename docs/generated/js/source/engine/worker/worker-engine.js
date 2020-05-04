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
		this.nextScene = null;
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
		this.dataStore = new DataStore(localStorageData, this, true);

		this.keyboard = new Keyboard(null, {
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

		this.addEventListener("sceneChange", () => {
			this.sceneRefresher.init(this.currentScene);
			this.spriteDataProcessor.init(this.currentScene);
			this.spriteDefinitionProcessor.init(this.currentScene.sprites);
			this.spriteDefinitionProcessor.init(this.currentScene.ui);
		});
	}

	processPayload({
		time,
		keysUp,
		keysDown,
	}) {
		const { currentScene, sceneRefresher, spriteDataProcessor, spriteDefinitionProcessor,
			uiProvider, spriteProvider } = this;
		if (!currentScene) {
			return;
		}
		if (!currentScene.startTime) {
			currentScene.startTime = time;
			return;
		}
		const now = time - currentScene.startTime;
		currentScene.now = now;

		if (keysUp || keysDown) {
			this.keyboard.updateKeys(keysUp, keysDown);
		}

		sceneRefresher.refresh(currentScene);
		spriteDataProcessor.refresh(currentScene);
		spriteDefinitionProcessor.refresh(currentScene.ui, now);
		spriteDefinitionProcessor.refresh(currentScene.sprites, now);

		const frameDuration = 1000 / currentScene.getFrameRate();

		const spriteCollector = [], uiCollector = [];


		if (time - this.lastRefresh >= frameDuration) {
			const shouldResetScene = this.nextScene;
			this.lastRefresh = now;

			spriteDataProcessor.process(currentScene);

			//	process UI
			const uiComponents = spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider, uiCollector);

			//	show sprites to process
			const sprites = shouldResetScene ? spriteDefinitionProcessor.ignore() : spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider, spriteCollector);

			// glRenderer.setTime(now);
			// glRenderer.clearScreen();

			//	render uiComponents
			// sceneRenderer.render(currentScene);
			// uiRenderer.render(uiComponents, now);
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
				this.resetScene(this.nextScene);
			}
			// glRenderer.resetPools();
		}

	}

	// loop(time) {
	// 	time = Math.round(time);
	// 	const { currentScene, keyboard, } = this;
	// 	if (!currentScene) {
	// 		return;
	// 	}
	// 	if (!currentScene.startTime) {
	// 		currentScene.startTime = time;
	// 		return;
	// 	}
	// 	const now = time - currentScene.startTime;
	// 	currentScene.now = now;
	// 	console.log(currentScene.name, currentScene.now);

	// 	const frameDuration = 1000 / currentScene.getFrameRate();


	// }

	sendCommand(component, command, ...parameters) {
		self.postMessage({
			action: "engine",
			component,
			command,
			parameters,
		});		
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
//		this.uiProvider.clear();
		this.spriteProvider.clear();
	}

	resetScene(sceneName) {
		this.nextScene = null;
		const { sceneManager, dataStore, configProcessor } = this;
		if (sceneManager.hasScene(sceneName)) {
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor);

			this.currentScene = scene;
			this.currentScene.startTime = 0;
			this.currentScene.now = 0;
			this.currentScene.setEngine(this);
			this.onSceneChangeListener.forEach(callback => callback({name:sceneName, scene, config: scene.config}));
			this.sendCommand("logger", "log", "ping back");
		}
	}		
}
