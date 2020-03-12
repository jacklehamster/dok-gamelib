class SceneManager {
	constructor(DefaultGameClass) {
		this.DefaultGameClass = DefaultGameClass;
		this.rawScenes = {};
		this.scenes = {};
		this.firstScene = null;
		this.configProcessor = new ConfigProcessor();
	}

	add(name, GameClass, config) {
		if (!GameClass) {
			GameClass = this.DefaultGameClass;
		}
		const sceneObj = new GameClass();
		sceneObj.name = name;

		this.rawScenes[name] = config;
 		Object.assign(sceneObj, this.configProcessor.process(config, sceneObj));

		this.scenes[name] = sceneObj;
		if (sceneObj.firstScene) {
			if (this.firstScene) {
				console.warn(`First scene already set: ${this.firstScene.name}. Unable to set ${sceneObj.name} as first scene.`);
			} else {
				this.firstScene = sceneObj;
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

	static add(GameClass, scene) {
		SceneManager.instance.add(SceneManager.loadingSceneName, GameClass, scene);
	}
}
SceneManager.instance = new SceneManager(Game);
