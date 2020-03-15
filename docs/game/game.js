/**
 *	Game
 */

class Game {
	getFrameRate() {
		return this.evaluate(this.settings.frameRate);
	}

	evaluate(value, ...params) {
		return value(this, ...params);
	}
}