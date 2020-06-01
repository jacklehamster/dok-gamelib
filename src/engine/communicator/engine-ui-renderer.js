/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineUIRenderer {
	constructor(communicator) {
		this.communicator = communicator;
	}

	createElement(elementId, instanceIndex, type, hasOnClick) {
		this.communicator.sendCommand(Commands.UI_CREATE_ELEMENT, elementId, instanceIndex, type, hasOnClick);
	}

	setParent(elementId, parent) {
		this.communicator.sendCommand(Commands.UI_SET_PARENT, elementId, parent);
	}

	setClass(elementId, classList) {
		this.communicator.sendCommand(Commands.UI_SET_CLASS, elementId, classList);
	}

	setStyle(elementId, s, value) {
		this.communicator.sendCommand(Commands.UI_SET_STYLE, elementId, s, value);
	}

	setText(elementId, text) {
		this.communicator.sendCommand(Commands.UI_SET_TEXT, elementId, text);
	}

	setSize(elementId, width, height) {
		this.communicator.sendCommand(Commands.UI_SET_SIZE, elementId, width, height);
	}

	setCanvas(elementId, canvas) {
		this.communicator.sendCommand(Commands.UI_SET_CANVAS, elementId, canvas);
	}	

	removeElement(elementId) {
		this.communicator.sendCommand(Commands.UI_REMOVE_ELEMENT, elementId);
	}
}
