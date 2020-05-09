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
 	constructor(engineCommunicator, data) {
 		super();
 		this.engineCommunicator = engineCommunicator;
 		this.sync(data);
 	}

 	save() {
		this.engineCommunicator.sendCommand(Commands.DATA_SAVE, null, [this.getData()]);
 	}
}