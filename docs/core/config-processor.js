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
 			return ConfigProcessor.processLeafValue(obj, sceneObj);
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

	static processLeafValue(value, sceneObj) {
		return new GameProperty(value, sceneObj);
	}

 	static defaultEval(property, sceneObj) {
 		if (property && property.constructor === GameProperty) {
 			return property.get();
 		}
		if (Array.isArray(property)) {
			return property.map(t => ConfigProcessor.defaultEval(t, sceneObj));
		}
 		if (property && typeof(property) === 'object' && property.constructor !== GameProperty) {
 			const result = {};
 			for (let p in property) {
 				if (property.hasOwnProperty(p)) {
 					result[p] = ConfigProcessor.defaultEval(property[p], sceneObj);
 				}
 			}
 			return result;
 		}
 		console.error("Shouldn't reach this code.");
 		return property;
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
 		return ConfigProcessor.processLeafValue(value, sceneObj);
 	}
}
