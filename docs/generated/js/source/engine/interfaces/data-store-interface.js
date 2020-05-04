/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	IDataStore
 */

class IDataStore {
	sync(data) {
		this.data = data;
	}

 	getData() {
 		return this.data;
 	}

 	save() {
 		throw new Error("Class must be overwritten");
 	}

 	getSituation(name) {
 		const { situations } = this.data;
 		if (!situations[name]) {
 			situations[name] = {};
 		}
 		return situations[name];
 	}
}