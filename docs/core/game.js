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

	interpolate(value, finalValue, duration) {
		const time = this.now;
		duration = duration || 500;
		return ({now}, sprite, index) => {
			const progress = Math.min(1, (now - time) / duration);
			return progress * finalValue + (1 - progress) * value;
		};
	}
}