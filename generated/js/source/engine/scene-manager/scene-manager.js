/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SceneManager {
	constructor({Game, SpriteDefinition, AnimationDefinition}) {
		this.DefaultGameClass = Game;
		this.DefaultSpriteDefinitionClass = SpriteDefinition;
		this.DefaultAnimationDefinitionClass = AnimationDefinition;
		this.scenes = {};
		this.sceneNames = [];
	}

	add(name, {Game, SpriteDefinition, AnimationDefinition}, config) {
		if (this.scenes[name]) {
			return;
		}
		if (!Game) {
			Game = this.DefaultGameClass;
		}
		if (!SpriteDefinition) {
			SpriteDefinition = this.DefaultSpriteDefinitionClass;
		}
		if (!AnimationDefinition) {
			AnimationDefinition = this.DefaultAnimationDefinitionClass;
		}
		this.sceneNames.push(name);
		this.scenes[name] = {
			Game,
			SpriteDefinition,
			AnimationDefinition,
			config,
		};
	}

	hasScene(name) {
		return this.scenes[name];
	}

	createScene(name, dataStore, configProcessor, engine) {
		const { scenes } = this;
		const gameScene = scenes[name];
		if (gameScene) {
			const { Game, SpriteDefinition, AnimationDefinition, config } = gameScene;
			const classes = { Game, SpriteDefinition, AnimationDefinition };
			const sceneObj = new Game();
			sceneObj.init({engine, dataStore, name, config, classes})

	 		Object.assign(sceneObj, configProcessor.processScene(config, sceneObj));

	 		for (let i = 0; i < sceneObj.sprites.length; i++) {
	 			sceneObj.sprites[i] = new SpriteDefinition(sceneObj.sprites[i], sceneObj);
	 		}

	 		for (let i = 0; i < sceneObj.ui.length; i++) {
	 			sceneObj.ui[i] = new SpriteDefinition(sceneObj.ui[i], sceneObj);
	 		}

	 		for (let i = 0; i < sceneObj.spriteData.length; i++) {
	 			sceneObj.spriteData[i] = new AnimationDefinition(sceneObj.spriteData[i], sceneObj);
	 		}

			return sceneObj;
		}
		return null;
	}

	getFirstSceneName({firstScene}) {
		const scenes = [];
		for (let s in this.scenes) {
			if (s === firstScene) {
				return firstScene;
			}
			scenes.push(s);
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
SceneManager.instance = new SceneManager({Game, SpriteDefinition, AnimationDefinition});
