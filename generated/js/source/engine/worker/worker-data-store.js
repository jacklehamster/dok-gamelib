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
 	constructor(communicator, data) {
 		super();
 		this.communicator = communicator;
 		this.sync(data);
 	}

 	save() {
 		this.communicator.sendCommand(Commands.DATA_SAVE, this.getData());
 	}
}