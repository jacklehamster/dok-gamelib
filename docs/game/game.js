/**
 *	Game
 */

class Game {
	constructor() {
		this.lastRefresh = 0;
	}

	setEngine(value) {
		this.engine = value;
		this.videoManager = this.engine.videoManager;
	}

	get data() {
		return this.dataStore.getData();
	}

	get situation() {
		return this.dataStore.getSituation(this.name);
	}

	get scenes() {
		return this.engine.sceneManager.sceneNames;
	}

	gotoScene(name) {
		this.engine.resetScene(name);
	}

	getFrameRate() {
		return this.settings.frameRate.get();
	}

	getVideo(name) {
		return this.videoManager.getVideo(name);
	}
}