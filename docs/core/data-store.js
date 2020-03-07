/**
 *	DataStore
 */

 class DataStore {
 	constructor() {
 		this.data = {
 			situations: {},
 		};
 	}

 	getSituation(name) {
 		const { situations } = this.data;
 		if (!situations[name]) {
 			situations[name] = {};
 		}
 		return situations[name];
 	}
 }