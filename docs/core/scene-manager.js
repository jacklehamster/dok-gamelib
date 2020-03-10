class SceneManager {
	constructor() {
		this.rawScenes = {};
		this.scenes = {};
		this.firstScene = null;
		this.configProcessor = new ConfigProcessor();
	}

	add(name, scene) {
		this.rawScenes[name] = scene;
		const processedScene = this.configProcessor.process(scene);
		processedScene.name = name;
		this.scenes[name] = processedScene;
		if (processedScene.firstScene) {
			if (this.firstScene) {
				console.warn(`First scene already set: ${this.firstScene.name}. Unable to set ${processedScene.name} as first scene.`);
			} else {
				this.firstScene = processedScene;
			}
		}
	}

	getFirstScene() {
		if (!this.firstScene) {
			for (let s in this.scenes) {
				console.warn(`First scene not defined. Set a scene with 'firstScene: true'. Using ${s} as first scene.`);
				return this.scenes[s];
			}
			console.warn("No scenes available.");
			return EMPTY_OBJECT;
		}
		return this.firstScene;
	}

	getScene(name) {
		return this.scenes[name];
	}

	static add(scene) {
		SceneManager.instance.add(SceneManager.loadingSceneName, scene);
	}
}
SceneManager.instance = new SceneManager();
