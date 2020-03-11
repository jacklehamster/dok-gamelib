/**
 *	Config Processor
 */


class ConfigProcessor {
	constructor() {
		this.schema = getData().schema.schema;
	}

 	process(obj, sceneObj, schema, path) {
 		if (!schema) {
 			schema = this.schema;
 		}
 		if (!path) {
 			path = "scene";
 		}
 		if (typeof(obj) !== 'object') {
			return typeof(obj) === 'function' ? obj.bind(sceneObj) : (() => obj).bind(sceneObj);
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
	 				const defaultValue = ConfigProcessor.defaultForSchema(schema[s], sceneObj);
	 				console.log(`Defaulting ${path}.${s} to ${JSON.stringify(ConfigProcessor.defaultEval(defaultValue, sceneObj))}`);
	 				result[s] = defaultValue;
	 			}
	 		}
 		}
 		return result;
 	}

 	static defaultEval(value, sceneObj) {
		if (Array.isArray(value)) {
			return value.map(t => ConfigProcessor.defaultForSchema(t, sceneObj));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.defaultEval(value[p], sceneObj);
 				}
 			}
 			return result;
 		}
 		return value();
 	}

 	static defaultForSchema(value, sceneObj) {
		if (Array.isArray(value)) {
			return value.map(t => ConfigProcessor.defaultForSchema(t, sceneObj));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.defaultForSchema(value[p], sceneObj);
 				}
 			}
 			return result;
 		}
 		return (() => value).bind(sceneObj);
 	}
}
