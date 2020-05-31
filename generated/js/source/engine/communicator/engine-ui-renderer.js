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

	createElement(elementId, instanceIndex, type, hasOnClick) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_CREATE_ELEMENT);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeInt(instanceIndex);
		this.engineCommunicator.communicator.payload.writeExtra(type);
		this.engineCommunicator.communicator.payload.writeUnsignedByte(hasOnClick ? 1 : 0);
	}

	setParent(elementId, parent) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_SET_PARENT);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeExtra(parent);
	}

	setClass(elementId, classList) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_SET_CLASS);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeExtra(classList);
	}

	setStyle(elementId, s, value) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_SET_STYLE);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeExtra(s);
		this.engineCommunicator.communicator.payload.writeExtra(value);
	}

	setText(elementId, text) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_SET_TEXT);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeExtra(text);
	}

	setSize(elementId, width, height) {
		this.engineCommunicator.sendCommandInt(Commands.UI_SET_SIZE);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeUnsignedShort(width);
		this.engineCommunicator.communicator.payload.writeUnsignedShort(height);
	}

	setCanvas(elementId, canvas) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_SET_CANVAS);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
		this.engineCommunicator.communicator.payload.writeExtra(canvas);
	}	

	removeElement(elementId) {
		this.engineCommunicator.communicator.payload.writeCommand(Commands.UI_REMOVE_ELEMENT);
		this.engineCommunicator.communicator.payload.writeExtra(elementId);
	}
}
