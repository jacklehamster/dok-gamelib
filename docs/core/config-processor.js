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

 	static getRootSchema() {
 		return {
			name: null,
			firstScene: false,
			init: null,
			refresh: null,
			keyboard: {
				onKeyPress: null,
				onKeyRelease: null,
				onLeftPress: null,
				onLeftRelease: null,
				onRightPress: null,
				onRightRelease: null,
				onDownPress: null,
				onDownRelease: null,
				onUpPress: null,
				onUpRelease: null,
			},
			settings: {
				docBackground: 0,
				background: 0,
				curvature: 0,
			},
			view: {
				pos: [
					0,
					0,
					0,
				],
				angle: 45,
				height: 0,
				turn: 0,
				cameraDistance: 7,
			},
			sprites: [
				{
					src: null,
					type: 0,
					hidden: false,
					light: 0,
					pos: [
						0,
						0,
						0,
					],
					grid: [1, 1],
					animation: {
						start: 0,
						frame: 0,
						range: 1,
						frameRate: 0,
					},
					size: [1, 1],
					hotspot: [ 0, 0 ],
					count: 1,
					init: null,
					refresh: null,
				},
			],
		};
 	}
}
