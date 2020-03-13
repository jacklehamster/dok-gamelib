class SceneManager {
	constructor({Game, SpriteDefinition}) {
		this.DefaultGameClass = Game;
		this.DefaultSpriteDefinitionClass = SpriteDefinition;
		this.rawScenes = {};
		this.scenes = {};
		this.firstScene = null;
		this.configProcessor = new ConfigProcessor();
	}

	add(name, {Game, SpriteDefinition}, config) {
		if (!Game) {
			Game = this.DefaultGameClass;
		}
		if (!SpriteDefinition) {
			SpriteDefinition = this.DefaultSpriteDefinitionClass;
		}
		const sceneObj = new Game();
		sceneObj.name = name;

		this.rawScenes[name] = config;
 		Object.assign(sceneObj, this.configProcessor.process(config, sceneObj));

 		for (let i = 0; i < sceneObj.sprites.length; i++) {
 			const spriteDefinition = new SpriteDefinition(sceneObj);
 			Object.assign(spriteDefinition, sceneObj.sprites[i]);
 			sceneObj.sprites[i] = spriteDefinition;
 		}

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

	static add(classes, scene) {
		SceneManager.instance.add(SceneManager.loadingSceneName, classes, scene);
	}
}
SceneManager.instance = new SceneManager({Game, SpriteDefinition});
