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
	constructor(now) {
		super(now);
	}

	init() {
		this.id = null;
		this.tag = null;
		this.parent = null;
		this.classList = null;
		this.style = {};
		this.innerText = null;
		this.width = 0;
		this.height = 0;
		this.events = null;
		this.canvas = null;
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

		if (this.canvas !== canvas) {
			this.canvas = canvas;
			updateTimes.canvas = now;
		}
	}
}