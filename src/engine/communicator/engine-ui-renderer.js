/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineUIRenderer {
	constructor(bufferTransport) {
		this.bufferTransport = bufferTransport;
	}

	createElement(elementId, instanceIndex, type, hasOnClick) {
		this.bufferTransport.sendCommand(Commands.UI_CREATE_ELEMENT, elementId, instanceIndex, type, hasOnClick);
	}

	setParent(elementId, parent) {
		this.bufferTransport.sendCommand(Commands.UI_SET_PARENT, elementId, parent);
	}

	setClass(elementId, classList) {
		this.bufferTransport.sendCommand(Commands.UI_SET_CLASS, elementId, classList);
	}

	setStyle(elementId, s, value) {
		this.bufferTransport.sendCommand(Commands.UI_SET_STYLE, elementId, s, value);
	}

	setText(elementId, text) {
		this.bufferTransport.sendCommand(Commands.UI_SET_TEXT, elementId, text);
	}

	setSize(elementId, width, height) {
		this.bufferTransport.sendCommand(Commands.UI_SET_SIZE, elementId, width, height);
	}

	setCanvas(elementId, canvas) {
		this.bufferTransport.sendCommand(Commands.UI_SET_CANVAS, elementId, canvas);
	}	

	removeElement(elementId) {
		this.bufferTransport.sendCommand(Commands.UI_REMOVE_ELEMENT, elementId);
	}
}
