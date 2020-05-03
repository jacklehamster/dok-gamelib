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
		this.nextScene = null;
		this.currentScene = null;
		this.data = data;
		this.onSceneChangeListener = [];
		this.sceneManager = sceneManager;
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.configProcessor = new ConfigProcessor(this.data);
		this.dataStore = new DataStore(localStorageData, this);
	}

	beginLooping() {
		const engine = this;
		function animationFrame(time) {
			requestAnimationFrame(animationFrame);
			engine.loop();
		}
		requestAnimationFrame(animationFrame);
	}

	loop() {
	}

	sendCommand(component, command, ...parameters) {
		self.postMessage({
			action: "engine",
			component,
			command,
			parameters,
		});		
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
