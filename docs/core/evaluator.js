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


	interpolate(value, finalValue, duration) {
		const now = this.timeMillis;
		duration = duration || 500;
		return ({timeMillis}, sprite, index) => {
			const progress = Math.min(1, (timeMillis - now) / duration);
			return progress * finalValue + (1 - progress) * value;
		};
	}	
}