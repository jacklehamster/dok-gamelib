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
	constructor(engine) {
		super();
		this.engine = engine;
	}

	log(...message) {
		this.engine.sendCommand("logger", "log", ...message);		
	}
}