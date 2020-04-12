/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 * GameProperty
 */



class GameProperty {
	init(value, game) {
		const dynamic = typeof(value) === 'function';
		this.originalValue = value;
		this.value = dynamic ? value.bind(game) : () => value;
		this.game = game;
		this.definition = game;
		return this;
	}

	get now() {
		return this.game.now;
	}

	get(...params) {
		return this.value(this, ...params);
	}

	run(...params) {
		this.value(this, ...params);
	}
}