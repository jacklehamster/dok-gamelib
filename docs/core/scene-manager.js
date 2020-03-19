class SceneManager {
	constructor({Game, SpriteDefinition}) {
		this.DefaultGameClass = Game;
		this.DefaultSpriteDefinitionClass = SpriteDefinition;
		this.scenes = {};
		this.sceneNames = [];
		this.configProcessor = new ConfigProcessor();
	}

	add(name, {Game, SpriteDefinition}, config) {
		if (this.scenes[name]) {
			return;
		}
		if (!Game) {
			Game = this.DefaultGameClass;
		}
		if (!SpriteDefinition) {
			SpriteDefinition = this.DefaultSpriteDefinitionClass;
		}
		this.sceneNames.push(name);
		this.scenes[name] = {
			Game,
			SpriteDefinition,
			config,
		};
	}

	createScene(name) {
		const gameScene = this.scenes[name];
		if (gameScene) {
			const { Game, SpriteDefinition, config } = gameScene;
			const sceneObj = new Game();
			sceneObj.name = name;

	 		Object.assign(sceneObj, this.configProcessor.process(config, sceneObj));

	 		for (let i = 0; i < sceneObj.sprites.length; i++) {
	 			const spriteDefinition = new SpriteDefinition(sceneObj);
	 			Object.assign(spriteDefinition, sceneObj.sprites[i]);
	 			sceneObj.sprites[i] = spriteDefinition;
	 		}
			return sceneObj;
		}
		return null;
	}

	getFirstSceneName() {
		const firstScenes = [];
		const scenes = [];
		for (let s in this.scenes) {
			const { config } = this.scenes[s];
			if (config.firstScene && (typeof(config.firstScene)==='function' ? config.firstScene() : config.firstScene)) {
				firstScenes.push(s);
			}
			scenes.push(s);
		}

		if (firstScenes.length) {
			return firstScenes[Math.floor(Math.random() * firstScenes.length)];		
		}

		if (scenes.length) {
			const sceneName = scenes[Math.floor(Math.random() * scenes.length)];
			console.warn(`First scene not defined. Set a scene with 'firstScene: true'. Using ${sceneName} as first scene.`);
			return sceneName;
		}

		console.warn("No scenes available.");
		return null;
	}

	static add(classes, scene) {
		SceneManager.instance.add(SceneManager.loadingSceneName, classes, scene);
	}
}
SceneManager.instance = new SceneManager({Game, SpriteDefinition});
