/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class WorkerUIRenderer {
	constructor(engineCommunicator) {
		this.engineCommunicator = engineCommunicator;
	}

	loadToBuffer(commandId, ...params) {
		this.engineCommunicator.loadToBuffer(commandId, params, extra);
	}

	loadExtra(...extra) {
		this.engineCommunicator.loadExtra(extra);
	}

	createElement(elementId, instanceIndex, type) {
		this.loadToBuffer(Commands.UI_CREATE_ELEMENT, instanceIndex);
		this.loadExtra(elementId, type);
	}

	setParent(elementId, parent) {
		this.loadToBuffer(Commands.UI_SET_PARENT);
		this.loadExtra(elementId, parent);
	}

	setClass(elementId, classList) {
		this.loadToBuffer(Commands.UI_SET_CLASS);
		this.loadExtra(elementId, classList);
	}

	setStyle(elementId, s, value) {
		this.loadToBuffer(Commands.UI_SET_STYLE);
		this.loadExtra(elementId, s, value);
	}

	setText(elementId, text) {
		this.loadToBuffer(Commands.UI_SET_TEXT);
		this.loadExtra(elementId, text);
	}

	setSize(elementId, width, height) {
		this.loadToBuffer(Commands.UI_SET_STYLE, width, height);
		this.loadExtra(elementId);
	}

	setCanvas(elementId, canvas) {
		this.loadToBuffer(Commands.UI_SET_CANVAS);
		this.loadExtra(elementId, canvas);
	}	
}