/**
   	Evaluator
 */

class Evaluator {
	constructor() {
		this.now = 0;
		this.scene = {};
	}

	setScene(scene) {
		this.scene = scene;
	}

	evaluate(value, ...params) {
		return typeof value === "function" ? value(this, ...params) : value;
	}


	interpolate(value, finalValue, duration) {
		const now = this.now;
		duration = duration || 500;
		return ({now}, sprite, index) => {
			const progress = Math.min(1, (now - now) / duration);
			return progress * finalValue + (1 - progress) * value;
		};
	}	
}