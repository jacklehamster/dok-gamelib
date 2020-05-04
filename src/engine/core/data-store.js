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

class DataStore extends IDataStore {
 	constructor(localStorage) {
 		super();
 		this.localStorage = localStorage;
 		this.data = this.loadDataFromLocalStorage() || {
 			situations: {},
 		};
 	}

 	loadDataFromLocalStorage() {
		const data = this.localStorage.getItem("data");
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

 	sync(data) {
 		super.sync(data);
 		this.save();
 	}

 	save() {
		this.localStorage.setItem("data", JSON.stringify(this.data));
 	}
}