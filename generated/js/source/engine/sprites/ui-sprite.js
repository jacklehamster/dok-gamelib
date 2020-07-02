/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	UISprite
*/

class UISpriteInstance extends BaseSpriteInstance {
	constructor() {
		super();
	}

	init() {
		super.init();
		this.id = null;
		this.type = null;
		this.parent = null;
		this.classList = null;
		this.style = {};
		this.innerText = null;
		this.width = 0;
		this.height = 0;
		this.events = null;
		this.canvas = {
			refreshRate: null,
			draw: [],
		};
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		const { instanceIndex, updateTimes } = this;
		const { now } = game;

		const { id, type, parent, classList, style, innerText, width, height, events, canvas } = definition;

		const newType = type.get(instanceIndex);
		const newId = id.get(instanceIndex);
		if (this.forceAll || this.id !== newId || this.type !== newType) {
			this.id = newId;
			this.type = newType;
			updateTimes.id = now;
		}

		const newParent = parent.get(instanceIndex);
		if (this.forceAll || this.parent !== newParent) {
			this.parent = newParent;
			updateTimes.parent = now;
		}

		const newClassList = classList.get(instanceIndex);
		if (this.forceAll || this.classList !== newClassList) {
			this.classList = newClassList;
			updateTimes.classList = now;
		}

		for (let s in this.style) {
			if (!style[s]) {
				delete this.style[s];
				updateTimes.style = now;
			}
		}

		for (let s in style) {
			const newStyle = style[s].get(instanceIndex);
			if (this.forceAll || this.style[s] !== newStyle) {
				this.style[s] = newStyle;
				updateTimes.style = now;
			}
		}

		const newInnerText = innerText.get(instanceIndex);
		if (this.forceAll || this.innerText !== newInnerText) {
			this.innerText = newInnerText;
			updateTimes.innerText = now;
		}

		const newWidth = width.get(instanceIndex);
		const newHeight = height.get(instanceIndex);
		if (this.forceAll || this.width !== newWidth || this.height !== newHeight) {
			this.width = newWidth;
			this.height = newHeight;
			updateTimes.size = now;
		}

		if (this.events !== events) {
			this.events = events;
			updateTimes.events = now;
		}

		if (this.type === "canvas") {
			const canvasRefresh = canvas.refreshRate.get(instanceIndex) || 60;
			if (this.forceAll || this.canvas.refreshRate !== canvasRefresh) {
				this.canvas.refreshRate = canvasRefresh;
				updateTimes.canvas = now;
			}

			if (this.forceAll || this.canvas.draw.length !== canvas.draw.length) {
				this.canvas.draw.length = canvas.draw.length;
				updateTimes.canvas = now;
			}

			for (let i = 0; i < canvas.draw.length; i++) {
				if (!this.canvas.draw[i]) {
					this.canvas.draw[i] = [];
				}
				const count = canvas.draw[i].count.get(instanceIndex);
				if (this.forceAll || this.canvas.draw[i].length !== count) {
					this.canvas.draw[i].length = count;
					updateTimes.canvas = now;
				}
				for (let c = 0; c < count; c++) {
					if (!this.canvas.draw[i][c]) {
						this.canvas.draw[i][c] = {};
						updateTimes.canvas = now;
					}
					const drawDefinition = canvas.draw[i];
					const thisDraw = this.canvas.draw[i][c];
					for (let prop in drawDefinition) {
						switch(prop) {
							case "count":
								break;
							case "phase": {
								const { phase } = drawDefinition;
								if (!thisDraw.phase) {
									thisDraw.phase = [];
									updateTimes.canvas = now;
								}
								if (this.forceAll || thisDraw.phase.length !== phase.length) {
									thisDraw.phase.length = phase.length;
									updateTimes.canvas = now;
								}
								let phaseChanged = false;
								for (let z = 0; z < phase.length; z++) {
									const phaseStep = phase[z].get(c, instanceIndex);
									if (this.forceAll || phaseStep !== thisDraw.phase[z]) {
										thisDraw.phase[z] = phaseStep;
										phaseChanged = true;
										updateTimes.canvas = now;
									}
								}
								if (phaseChanged) {
									if (!thisDraw.phaseTimes)
										thisDraw.phaseTimes = [];
									thisDraw.phaseTimes.length = thisDraw.phase.length;
									let time = 0;
									thisDraw.phase.forEach((step, index) => {
										time += step;
										thisDraw.phaseTimes[index] = time;
									});
								}
								break;
							}
							default:
								const propValue = drawDefinition[prop].get(c, instanceIndex);
								if (this.forceAll || thisDraw[prop] !== propValue) {
									thisDraw[prop] = propValue;
									updateTimes.canvas = now;
								}
								break;
						}
					}

				}
			}
		} else if (this.canvas.draw.length) {
			this.canvas.draw.length = 0;
			updateTimes.canvas = now;
		}
	}
}