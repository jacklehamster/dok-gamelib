class SceneManager {
	constructor() {
		this.rawScenes = {};
		this.scenes = {};
		this.firstScene = null;
		this.configProcessor = new ConfigProcessor();
	}

	add(scene) {
		this.rawScenes[scene.name] = scene;
		const processedScene = this.configProcessor.process(scene);
		this.scenes[scene.name] = processedScene;
		if (scene.firstScene) {
			if (this.firstScene) {
				console.warn(`First scene already set: ${this.firstScene.name}. Unable to set ${scene.name} as first scene.`);
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
		SceneManager.instance.add(scene);
	}
}
SceneManager.instance = new SceneManager();
