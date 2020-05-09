/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class EngineUIRenderer {
	constructor(engineCommunicator) {
		this.engineCommunicator = engineCommunicator;
	}

	loadToBuffer(commandId, ...params) {
		this.engineCommunicator.loadToBuffer(commandId, params);
	}

	createElement(elementId, instanceIndex, type, onClick) {
		this.loadToBuffer(Commands.UI_CREATE_ELEMENT, elementId, instanceIndex, type, onClick);
	}

	setParent(elementId, parent) {
		this.loadToBuffer(Commands.UI_SET_PARENT, elementId, parent);	
	}

	setClass(elementId, classList) {
		this.loadToBuffer(Commands.UI_SET_CLASS, elementId, classList);
	}

	setStyle(elementId, s, value) {
		this.loadToBuffer(Commands.UI_SET_STYLE, elementId, s, value);
	}

	setText(elementId, text) {
		this.loadToBuffer(Commands.UI_SET_SIZE, elementId, text);
	}

	setSize(elementId, width, height) {
		this.loadToBuffer(Commands.UI_SET_SIZE, elementId, width, height);
	}

	setCanvas(elementId, canvas) {
		this.loadToBuffer(Commands.UI_SET_CANVAS, canvas);
	}	
}