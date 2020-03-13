/**
 *	SpriteDefinition
 */

class SpriteDefinition {
	constructor(game) {
		this.game = game;
	}

	evaluate(value, ...params) {
		return this.game.evaluate(value, ...params);
	}
}