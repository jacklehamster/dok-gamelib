class Evaluator {
	constructor() {
		this.timeMillis = 0;
		this.scene = {};
	}

	setScene(scene) {
		this.scene = scene;
	}

	evaluate(value, ...params) {
		return typeof value === "function" ? value(this, ...params) : value;
	}
}