/**
 *	Config Processor
 */


class ConfigProcessor {
	constructor() {
		this.schema = getData().schema.schema;
	}

	checkDynamicProperties(obj, schema) {
		if (!schema) {
			schema = this.schema;
		}
		if (typeof(obj) !== 'object') {
			return typeof(obj) === 'function';
		}
 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			obj.forEach((value, index) => result[index] = this.checkDynamicProperties(value, schema[0]));
 		} else {
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			if (typeof(schema[o]) !== 'undefined') {
			 			result[o] = this.checkDynamicProperties(obj[o], schema[o]);
		 			}
	 			}
	 		}
	 		for (let s in schema) {
	 			if (!result.hasOwnProperty(s)) {
	 				result[s] = ConfigProcessor.dynamicPropertiesForSchema(schema[s]);
	 			}
	 		}
 		}
 		return result;
	}

 	process(obj, sceneObj, schema, path) {
 		if (!schema) {
 			schema = this.schema;
 		}
 		if (!path) {
 			path = "scene";
 		}
 		if (typeof(obj) !== 'object') {
			return typeof(obj) === 'function' ? obj.bind(sceneObj) : () => obj;
 		}
 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			obj.forEach((value, index) => result[index] = this.process(value, sceneObj, schema[0], `${path}[${index}]`));
 		} else {
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			if (typeof(schema[o]) === 'undefined') {
		 				console.warn(`Unknown config property: ${path}.${o}`);
		 			}
		 			result[o] = this.process(obj[o], sceneObj, schema[o], `${path}.${o}`);
	 			}
	 		}
	 		for (let s in schema) {
	 			if (!result.hasOwnProperty(s)) {
	 				const defaultValue = ConfigProcessor.defaultForSchema(schema[s]);
	 				console.log(`Defaulting ${path}.${s} to ${JSON.stringify(ConfigProcessor.defaultEval(defaultValue, sceneObj))}`);
	 				result[s] = defaultValue;
	 			}
	 		}
 		}
 		return result;
 	}

 	static defaultEval(value) {
		if (Array.isArray(value)) {
			return value.map(t => ConfigProcessor.defaultForSchema(t));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.defaultEval(value[p]);
 				}
 			}
 			return result;
 		}
 		return value();
 	}

 	static defaultForSchema(value) {
		if (Array.isArray(value)) {
			return value.map(t => ConfigProcessor.defaultForSchema(t));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.defaultForSchema(value[p]);
 				}
 			}
 			return result;
 		}
 		return () => value;
 	}

 	static dynamicPropertiesForSchema(value) {
		if (Array.isArray(value)) {
			return value.map(t => ConfigProcessor.dynamicPropertiesForSchema(t));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.dynamicPropertiesForSchema(value[p]);
 				}
 			}
 			return result;
 		}
 		return false; 		
 	}
}
