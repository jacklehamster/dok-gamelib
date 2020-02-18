class SceneManager {
	constructor() {
		this.scenes = {};
	}

	add(scene) {
		this.scenes[scene.name] = scene;
	}

	getScene(name) {
		return this.scenes[name];
	}
}
const sceneManager = new SceneManager();
