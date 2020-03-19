/**
 *	Game
 */

class Game {
	constructor() {
	}

	get scenes() {
		return this.engine.sceneManager.sceneNames;
	}

	gotoScene(name) {
		this.engine.resetScene(name);
	}

	getFrameRate() {
		return this.evaluate(this.settings.frameRate);
	}

	evaluate(value, ...params) {
		return value(this, ...params);
	}
}