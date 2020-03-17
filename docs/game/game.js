/**
 *	Game
 */

class Game {
	constructor() {
	}

	gotoScene(name) {
		this.engine.setScene(name);
	}

	getFrameRate() {
		return this.evaluate(this.settings.frameRate);
	}

	evaluate(value, ...params) {
		return value(this, ...params);
	}
}