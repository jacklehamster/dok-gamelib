/**
   	Game
 */

class Game {
	constructor() {
		this.dataStore = new DataStore();
		this.now = 0;
		this.keys = null;
		this.scene = {};
		this.sceneData = {};
		this.situation = {};
	}

	setScene(scene) {
		this.scene = scene;
		this.sceneData = {};
		this.situation = this.dataStore.getSituation(scene.name);
	}

	evaluate(value, ...params) {
		return value(this, ...params);
	}
}