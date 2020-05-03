/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	DataStore
 */

class DataStore {
 	constructor(localStorageData, engine) {
 		this.engine = engine;
 		this.data = localStorageData || this.loadDataFromLocalStorage() || {
 			situations: {},
 		};
 	}

 	loadDataFromLocalStorage() {
		const data = localStorage.getItem("data");
		if (!data) {
			return null;
		}
		try {
			return JSON.parse(data);
		} catch(e) {
			console.error(e);
			return null;
		}
 	}

 	getData() {
 		return this.data;
 	}

 	syncData(data) {
 		this.engine.sendCommand("dataStore", "save", this.getData());
 	}

 	save(data) {
 		if (typeof(localStorage) === "undefined") {
 			this.syncData();
 		} else {
 			if (data) {
	 			this.data = data;
 			}
			localStorage.setItem("data", JSON.stringify(this.data));
 		}
 	}

 	getSituation(name) {
 		const { situations } = this.data;
 		if (!situations[name]) {
 			situations[name] = {};
 		}
 		return situations[name];
 	}
}