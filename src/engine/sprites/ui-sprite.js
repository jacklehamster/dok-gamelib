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
		if (this.id !== newId) {
			this.id = newId;
			this.type = newType;
		}

		const newParent = parent.get(instanceIndex);
		if (this.parent !== newParent) {
			this.parent = newParent;
		}

		const newClassList = classList.get(instanceIndex);
		if (this.classList !== newClassList) {
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
			if (this.style[s] !== newStyle) {
				this.style[s] = newStyle;
				updateTimes.style = now;
			}
		}

		const newInnerText = innerText.get(instanceIndex);
		if (this.innerText !== newInnerText) {
			this.innerText = newInnerText;
			updateTimes.innerText = now;
		}

		const newWidth = width.get(instanceIndex);
		const newHeight = height.get(instanceIndex);
		if (this.width !== newWidth || this.height !== newHeight) {
			this.width = newWidth;
			this.height = newHeight;
			updateTimes.size = now;
		}

		if (this.events !== events) {
			this.events = events;
			updateTimes.events = now;
		}

		const canvasRefresh = canvas.refreshRate.get(instanceIndex);
		if (this.canvas.refreshRate !== canvasRefresh) {
			this.canvas.refreshRate = canvasRefresh;
			updateTimes.canvas = now;
		}

		if (this.canvas.draw.length !== canvas.draw.length) {
			this.canvas.draw.length = canvas.draw.length;
			updateTimes.canvas = now;
		}

		for (let i = 0; i < canvas.draw.length; i++) {
			if (!this.canvas.draw[i]) {
				this.canvas.draw[i] = [];
			}
			const count = canvas.draw[i].count.get(instanceIndex);
			if (this.canvas.draw[i].lenth !== count) {
				this.canvas.draw[i].length = count;
				updateTimes.canvas = now;
			}
			for (let c = 0; c < count; c++) {
				if (!this.canvas.draw[i][c]) {
					this.canvas.draw[i][c] = {};
					updateTimes.canvas = now;
				}
				for (let p in canvas.draw[i]) {
					if (p !== 'count') {
						const prop = canvas.draw[i][p].get(c, instanceIndex);
						if (this.canvas.draw[i][c][p] !== prop) {
							this.canvas.draw[i][c][p] = prop;
							updateTimes.canvas = now;
						}
					}
				}

			}
		}
	}
}