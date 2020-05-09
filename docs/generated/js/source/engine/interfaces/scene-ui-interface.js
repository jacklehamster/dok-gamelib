/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class ISceneUI {
	createElement(elementId, instanceIndex, type, hasOnClick) {
		throw new Error("This method should be overwritten.");
	}

	setParent(elementId, parent) {
		throw new Error("This method should be overwritten.");
	}

	setClass(elementId, classList) {
		throw new Error("This method should be overwritten.");
	}

	setStyle(elementId, s, value) {
		throw new Error("This method should be overwritten.");
	}

	setText(elementId, text) {
		throw new Error("This method should be overwritten.");
	}

	setSize(elementId, width, height) {
		throw new Error("This method should be overwritten.");
	}

	setCanvas(elementId, canvas) {
		throw new Error("This method should be overwritten.");
	}

	removeElement(elementId) {
		throw new Error("This method should be overwritten.");
	}
}
