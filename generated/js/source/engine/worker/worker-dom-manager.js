/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
	WorkerDOMManager 
*/

class WorkerDOMManager extends IDOMManager {
	constructor(engineCommunicator) {
		super();
		this.engineCommunicator = engineCommunicator;
	}

	setBackgroundColor(color) {
		this.engineCommunicator.sendCommand(Commands.DOM_BG_COLOR, null, [color]);
	}
}