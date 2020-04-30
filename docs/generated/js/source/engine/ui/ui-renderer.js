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
	constructor(canvas, canvasRenderer) {
		this.canvas = canvas;
		this.canvasRenderer = canvasRenderer;
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

	setupEvents(element, events, instanceIndex) {
		const { onClick } = events;
		element.addEventListener("click", e => {
			onClick.run(e, instanceIndex);
		});
	}

	render(uiSprites, now) {
		const { elements } = this;

		for (let i = 0; i < uiSprites.length; i++) {
			const { type, id, classList, style, parent, innerText, instanceIndex, width, height, hidden, updateTimes, events, canvas } = uiSprites[i];
			if (id) {
				const elementId = `${id}${!instanceIndex ? "" : `-${instanceIndex}`}`;
				let element = elements[elementId] ? elements[elementId].element : null;
				if (!element) {
					element = document.createElement(type);
					element.id = elementId;
					elements[elementId] = { element, updated: 0 };
					this.setupEvents(element, events, instanceIndex);
				}
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
					const refreshRate = canvas.refreshRate.get(instanceIndex);
					if (now - (elements[elementId].lastDraw||0) > refreshRate) {
						elements[elementId].lastDraw = now;	

						const context = element.getContext("2d");
						for (let i = 0; i < canvas.draw.length; i++) {
							const { type, src, hidden, x, y, width, height, frame, strokeStyle, lineWidth, count } = canvas.draw[i];
							if (!hidden.get(instanceIndex)) {
								const newCount = count.get(instanceIndex);
								for (let c = 0; c < newCount; c++) {
									const newX = x.get(c, instanceIndex);
									const newY = y.get(c, instanceIndex);
									const newWidth = width.get(c, instanceIndex);
									const newHeight = height.get(c, instanceIndex);
									const newType = type.get(c, instanceIndex);
									switch(newType) {
										case "clear":
											context.clearRect(0, 0, element.width, element.height);
										break;
										case "image":
											const newSrc = src.get(c, instanceIndex);
											const newFrame = frame.get(c, instanceIndex);
											if (newSrc) {
												this.canvasRenderer.drawToCanvas(newSrc, newX, newY, newWidth, newHeight, element, newFrame);
											}
										break;
										case "rect":
											context.strokeStyle = strokeStyle.get(c, instanceIndex);
											context.lineWidth = lineWidth.get(c, instanceIndex);
											context.beginPath();
											context.rect(newX, newY, newWidth, newHeight);
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




