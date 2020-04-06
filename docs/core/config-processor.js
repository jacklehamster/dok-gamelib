/**
 *	Config Processor
 */


class ConfigProcessor {
	constructor() {
		this.schema = getData().schema.schema;
		this.gamePropertyPool = new Pool(
			() => new GameProperty(),
			gameProperty => gameProperty.init(null, null),
		);
	}

	processScene(config, scene) {
		this.gamePropertyPool.reset();
		return this.process(config, scene, this.schema, "scene");
	}

 	process(obj, sceneObj, schema, path) {
 		if (typeof(obj) !== 'object') {
 			return this.processLeafValue(obj, sceneObj);
 		}
 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			obj.forEach((value, index) => result[index] = this.process(value, sceneObj, schema ? schema[0] : null, `${path}[${index}]`));
 		} else {
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			if (!schema || typeof(schema[o]) === 'undefined') {
//		 				console.warn(`Unknown config property: ${path}.${o}`);
		 			}
		 			result[o] = this.process(obj[o], sceneObj, schema ? schema[o] : null, `${path}.${o}`);
	 			}
	 		}
	 		if (schema) {
		 		for (let s in schema) {
		 			if (!result.hasOwnProperty(s)) {
		 				const defaultValue = this.defaultForSchema(schema[s], sceneObj);
//		 				console.log(`Defaulting ${path}.${s} to ${JSON.stringify(ConfigProcessor.defaultEval(defaultValue, sceneObj))}`);
		 				result[s] = defaultValue;
		 			}
		 		}
	 		}
 		}
 		return result;
 	}

	processLeafValue(value, sceneObj) {
		return this.gamePropertyPool.get(true).init(value, sceneObj);
	}

 	static defaultEval(property, sceneObj) {
 		if (property && property.constructor === GameProperty) {
 			return property.get();
 		}
		if (Array.isArray(property)) {
			return property.map(t => ConfigProcessor.defaultEval(t, sceneObj));
		}
 		if (property && typeof(property) === 'object') {
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

 	defaultForSchema(value, sceneObj) {
		if (Array.isArray(value)) {
			return value.map(t => this.defaultForSchema(t, sceneObj));
		}
 		if (value && typeof(value) === 'object') {
 			const result = {};
 			for (let p in value) {
 				if (value.hasOwnProperty(p)) {
 					result[p] = this.defaultForSchema(value[p], sceneObj);
 				}
 			}
 			return result;
 		}
 		return this.processLeafValue(value, sceneObj);
 	}
}
