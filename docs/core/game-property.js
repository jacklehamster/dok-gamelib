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