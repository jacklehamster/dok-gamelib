



class GameProperty {
	constructor(value, game) {
		const dynamic = typeof(value) === 'function';
		this.value = dynamic ? value.bind(game) : () => value;
		this.dynamic = dynamic;
		this.game = game;
		this.definition = game;
	}

	get(index) {
		return this.value(this, index);
	}
}