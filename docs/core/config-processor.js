/**
 *	Config Processor
 */


class ConfigProcessor {
	constructor() {
		this.schema = getData().schema.schema;
	}

 	process(obj, schema, path) {
 		if (!schema) {
 			schema = this.schema;
 		}
 		if (!path) {
 			path = "scene";
 		}
 		if (typeof(obj) !== 'object') {
			return typeof(obj) === 'function' ? obj : () => obj;
 		}
 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			obj.forEach((value, index) => result[index] = this.process(value, schema[0], `${path}[${index}]`));
 		} else {
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			if (typeof(schema[o]) === 'undefined') {
		 				console.warn(`Unknown config property: ${path}.${o}`);
		 			}
		 			result[o] = this.process(obj[o], schema[o], `${path}.${o}`);
	 			}
	 		}
	 		for (let s in schema) {
	 			if (!result.hasOwnProperty(s)) {
	 				const defaultValue = ConfigProcessor.defaultForSchema(schema[s]);
		 			console.log(`Defaulting ${path}.${s} to ${JSON.stringify(ConfigProcessor.defaultEval(defaultValue))}`);
	 				result[s] = defaultValue;
	 			}
	 		}
 		}
 		return result;
 	}

 	validateScene(game, scene, data) {
 		const { sprites } = scene;
 		const { imagedata } = data.generated.config;
 		sprites.forEach(definition => {
 			const {src, count} = definition;
 			const countProcessed = game.evaluate(count, definition);
 			for (let i = 0; i < countProcessed; i++) {
	 			const srcProcessed = game.evaluate(src, definition, i);
	 			if (!imagedata.sprites[srcProcessed]) {
	 				console.error(`Invalid image src: ${srcProcessed}.`);
	 			}
 			}
 		});

 		console.log(scene, data);
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
}
