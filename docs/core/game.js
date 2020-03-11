/**
 *	Game
 */

class Game {
 	constructor(name) {
 		this.name = name;
 	}

	evaluate(value, ...params) {
		return value(this, ...params);
	}
}