/**
 *	Config Processor
 */


class ConfigProcessor {
 	process(obj, schema) {
 		if (!schema) {
 			schema = ConfigProcessor.getRootSchema();
 		}
 		if (typeof(obj) !== 'object') {
			return typeof(obj) === 'function' ? obj : () => obj;
 		}
 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			obj.forEach((value, index) => result[index] = this.process(value, schema[0]));
 		} else {
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			result[o] = this.process(obj[o], schema[o]);
	 			}
	 		}
	 		for (let s in schema) {
	 			if (!result.hasOwnProperty(s)) {
	 				result[s] = ConfigProcessor.defaultForSchema(schema[s]);
	 			}
	 		}
 		}
 		return result;
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
