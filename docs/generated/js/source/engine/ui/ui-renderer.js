/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
	UIRenderer 
*/

class UIRenderer {
	constructor(canvas, canvasRenderer, workerManager) {
		this.canvas = canvas;
		this.canvasRenderer = canvasRenderer;
		this.workerManager = workerManager;
		this.root = null;
		this.elements = {};
		window.addEventListener("resize", e => this.onResize());
	}

	ensureRoot() {
		if (this.root === null) {
			const { canvas } = this;
			this.root = canvas.parentElement.appendChild(document.createElement("div"));
			this.root.style.position = "absolute";
			this.root.classList.add("unselectable");
			this.root.style.top = `${canvas.offsetTop}px`;
			this.root.style.left = `${canvas.offsetLeft}px`;
			this.root.style.display = "flex";
		}
		return this.root;
	}

	onResize() {
		if (this.root) {
			this.root.style.top = `${this.canvas.offsetTop}px`;
			this.root.style.left = `${this.canvas.offsetLeft}px`;
		}
	}

	setupEvents(element, onClick, instanceIndex) {
		if (onClick && onClick.dynamic) {
			element.addEventListener("click", () => onClick.run(instanceIndex));
			if (this.workerManager) {
				element.addEventListener("click", () => this.workerManager.onClickUI(element.id, instanceIndex));
			}
		}
	}

	createElement(id, instanceIndex, type, onClick) {
		const { elements } = this;
		const elementId = `${id}${!instanceIndex ? "" : `-${instanceIndex}`}`;
		let element = elements[elementId] ? elements[elementId].element : null;
		if (!element) {
			element = document.createElement(type);
			element.id = elementId;
			elements[elementId] = { element, updated: 0 };
			this.setupEvents(element, onClick, instanceIndex);
		}
	}

	render(uiSprites, now) {
		const { elements } = this;
		window.uiSprites = uiSprites;

		for (let i = 0; i < uiSprites.length; i++) {
			const { type, id, classList, style, parent, innerText, instanceIndex, width, height, hidden, updateTimes, events: { onClick }, canvas } = uiSprites[i];
			if (id) {
				const elementId = `${id}${!instanceIndex ? "" : `-${instanceIndex}`}`;
				if (!elements[elementId]) {
					this.createElement(id, instanceIndex, type, onClick);
				}
				const element = elements[elementId].element;

				if (parent !== elements[elementId].parent) {
					elements[elementId].parent = parent;
					elements[elementId].needReparent = true;
				}
				if (updateTimes.classList === now) {
					element.classList.add(...classList.split(" "));
				}

				if (updateTimes.style === now || updateTimes.hidden === now) {
					for (let s in style) {
						if (s === "display") {
							element.style[s] = hidden ? "none" : style[s];
						} else {
							element.style[s] = style[s];
						}
					}
				}

				if (updateTimes.innerText === now) {
					element.innerText = innerText;
				}

				if (updateTimes.size === now) {
					if (width) {
						element.width = width;
					}
					if (height) {
						element.height = height;
					}
				}

				if (type === 'canvas') {
					const refreshRate = canvas.refreshRate;
					if (now - (elements[elementId].lastDraw||0) > refreshRate) {
						elements[elementId].lastDraw = now;	

						const context = element.getContext("2d");
						for (let i = 0; i < canvas.draw.length; i++) {
							const draws = canvas.draw[i];
							for (let d = 0; d < draws.length; d++) {
								const { type, src, hidden, x, y, width, height, frame, strokeStyle, lineWidth } = draws[d];
								if (!hidden) {
									switch(type) {
										case "clear":
											context.clearRect(0, 0, element.width, element.height);
										break;
										case "image":
											if (src) {
												this.canvasRenderer.drawToCanvas(src, x, y, width, height, element, frame);
											}
										break;
										case "rect":
											context.strokeStyle = strokeStyle;
											context.lineWidth = lineWidth;
											context.beginPath();
											context.rect(x, y, width, height);
											context.stroke();
										break;
									}
								}
							}
						}
					}
				}
				elements[elementId].updated = now;
			}
		}

		for (let e in elements) {
			const { updated, element } = elements[e];
			if (updated !== now) {
				if (element.parentElement) {
					element.parentElement.removeChild(element);
					delete elements[e];
				}
			}
		}

		for (let e in elements) {
			const { parent, needReparent, element } = elements[e];
			if (needReparent) {
				const p = !parent ? this.ensureRoot() : elements[parent] ? elements[parent].element : null;
				if (p) {
					p.appendChild(element);
				}
				elements[e].needReparent = false;
			}
		}

	}

	destroy() {
		for (let i in this.elements) {
			delete this.elements[i];
		}
		if (this.root) {
			this.root.parentElement.removeChild(this.root);
			this.root = null;
		}
	}
}




