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
	constructor(communicator) {
		super();
		this.communicator = communicator;
	}

	setBackgroundColor(color) {
		this.communicator.sendCommand(Commands.DOM_BG_COLOR, color);
	}
}