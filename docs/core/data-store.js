/**
 *	DataStore
 */

 class DataStore {
 	constructor() {
 		this.data = {
 			situations: {},
 		};
 	}

 	getData() {
 		return this.data;
 	}

 	getSituation(name) {
 		const { situations } = this.data;
 		if (!situations[name]) {
 			situations[name] = {};
 		}
 		return situations[name];
 	}
 }