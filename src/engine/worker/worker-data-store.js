/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	WorkerDataStore
  */

class WorkerDataStore extends IDataStore {
 	constructor(bufferTransport, data) {
 		super();
 		this.bufferTransport = bufferTransport;
 		this.sync(data);
 	}

 	save() {
 		this.bufferTransport.sendCommand(Commands.DATA_SAVE, this.getData());
 	}
}