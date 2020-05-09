/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	WorkerLogger
 */

class WorkerLogger extends ILogger {
	constructor(engineCommunicator) {
		super();
		this.engineCommunicator = engineCommunicator;
	}

	log(...message) {
		this.engineCommunicator.sendCommand(Commands.LOGGER_LOG_MESSAGE, null, [message]);
	}
}