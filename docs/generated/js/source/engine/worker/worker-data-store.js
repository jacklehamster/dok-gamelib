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
 	constructor(engine, data) {
 		super();
 		this.engine = engine;
 		this.sync(data);
 	}

 	save() {
 		this.engine.sendCommand("dataStore", "sync", this.getData());
 	}
}