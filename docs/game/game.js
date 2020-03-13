/**
 *	Game
 */

class Game {
	evaluate(value, ...params) {
		return value(this, ...params);
	}
}