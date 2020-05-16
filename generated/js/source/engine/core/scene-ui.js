/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	SceneGL
 */

class SceneUI extends ISceneUI {
	constructor(canvas, workerManager, canvasRenderer) {
		super();
		this.canvas = canvas;
		this.workerManager = workerManager;
		this.canvasRenderer = canvasRenderer;
		this.elements = {};
		this.root = null;
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

	createElement(elementId, instanceIndex, type, hasOnClick) {
		const { elements, workerManager } = this;
		let dom = elements[elementId] ? elements[elementId].dom : null;
		if (!dom) {
			dom = document.createElement(type);
			dom.id = elementId;
			elements[elementId] = { dom, type, canvas: null, lastDraw: 0 };
			if (workerManager && hasOnClick) {
				dom.addEventListener("click", () => workerManager.onClickUI(dom.id, instanceIndex));
			}
		}
	}

	setParent(elementId, parent) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		elements[elementId].parent = parent;
		elements[elementId].needReparent = true;		
	}

	setClass(elementId, classList) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		const { dom } = elements[elementId];
		dom.classList.add(...classList.split(" "));
	}

	setStyle(elementId, s, value) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		const { dom } = elements[elementId];
		dom.style[s] = value;		
	}

	setText(elementId, text) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		const { dom } = elements[elementId];
		dom.innerText = text;		
	}

	setSize(elementId, width, height) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		const { dom } = elements[elementId];
		if (width) {
			dom.width = width;
		}
		if (height) {
			dom.height = height;
		}		
	}

	setCanvas(elementId, canvas) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		elements[elementId].canvas = canvas;
	}

	removeElement(elementId) {
		const { elements } = this;
		if (!elements[elementId]) {
			return;
		}
		const { dom } = elements[elementId];
		if (dom.parentElement) {
			dom.parentElement.removeChild(dom);
			delete elements[elementId];
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

	shouldHide(now, phaseTimes) {
		if (phaseTimes) {
			const timeInPeriod = now % phaseTimes[phaseTimes.length - 1];
			for (let i = 0; i < phaseTimes.length; i++) {
				if (timeInPeriod < phaseTimes[i]) {
					return i % 2 === 1;	//	show-hide-show-hide
				}
			}
		}
		return false;
	}

	updateUI(now) {
		const { elements } = this;
		for (let e in elements) {
			const { parent, needReparent, dom, canvas, lastDraw } = elements[e];
			if (needReparent) {
				const p = parent === "root" ? this.ensureRoot() : elements[parent] ? elements[parent].dom : null;
				if (p) {
					if (dom.parentElement && dom.parentElement !== p) {
						dom.parentElement.removeChild(dom);
					}
					p.appendChild(dom);
				}
				delete elements[e].needReparent;
			}

			if (canvas && canvas.draw && canvas.draw.length) {
				const refreshRate = canvas.refreshRate;
				if (now - (lastDraw||0) > refreshRate) {
					elements[e].lastDraw = now;	

					const context = dom.getContext("2d");
					for (let i = 0; i < canvas.draw.length; i++) {
						const drawList = canvas.draw[i];
						for (let d = 0; d < drawList.length; d++) {
							const { type, src, hidden, x, y, width, height, frame, strokeStyle, lineWidth, phaseTimes } = drawList[d];
							const shouldHide = hidden || this.shouldHide(now, phaseTimes);
							if (!shouldHide) {
								switch(type) {
									case "clear":
										context.clearRect(0, 0, dom.width, dom.height);
									break;
									case "image":
										if (src) {
											this.canvasRenderer.drawToCanvas(src, x, y, width, height, dom, frame);
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
		}
	}
}