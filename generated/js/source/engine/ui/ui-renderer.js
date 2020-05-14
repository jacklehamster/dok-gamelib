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
	constructor(sceneUI) {
		this.sceneUI = sceneUI;
		this.elements = {};
	}

	triggegClick(id, instanceIndex) {
		const { elements } = this;
		if (elements[id] && elements[id].onClick) {
			elements[id].onClick.run(instanceIndex);
		}
	}

	render(uiSprites, now) {
		const { elements, sceneUI } = this;

		for (let i = 0; i < uiSprites.length; i++) {
			const { type, id, classList, style, parent, innerText, instanceIndex, width, height, hidden, updateTimes, events, canvas } = uiSprites[i];
			if (id) {
				if (!elements[id]) {
					elements[id] = {
						updated: now,
					};
				}
				const indexSuffix = !instanceIndex ? "" : `-${instanceIndex}`;
				const elementId = `${id}${indexSuffix}`;
				if (updateTimes.id === now) {
					const hasOnClick = events && events.onClick && events.onClick.dynamic;
					sceneUI.createElement(elementId, instanceIndex, type, hasOnClick);
					if (hasOnClick) {
						elements[id].onClick = events.onClick;
					}
				}

				if (updateTimes.parent === now) {
					sceneUI.setParent(elementId, parent);
				}

				if (updateTimes.classList === now) {
					sceneUI.setClass(elementId, classList);
				}

				if (updateTimes.style === now || updateTimes.hidden === now) {
					for (let s in style) {
						if (s === "display") {
							sceneUI.setStyle(elementId, s, hidden ? "none" : style[s]);
						} else {
							sceneUI.setStyle(elementId, s, style[s]);
						}
					}
				}

				if (updateTimes.innerText === now) {
					sceneUI.setText(elementId, innerText);
				}

				if (updateTimes.size === now) {
					sceneUI.setSize(elementId, width, height);
				}

				if (updateTimes.canvas === now) {
					sceneUI.setCanvas(elementId, canvas);
				}

				elements[elementId].updated = now;
			}
		}

		for (let id in elements) {
			if (elements[id].updated !== now) {
				delete elements[id];
				sceneUI.removeElement(id);
			}
		}
	}

	clear() {
		const { elements, sceneUI } = this;
		for (let id in elements) {
			sceneUI.removeElement(id);
			delete elements[id];
		}
	}
}
