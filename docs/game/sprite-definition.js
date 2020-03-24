/**
 *	SpriteDefinition
 */

class SpriteDefinition {
	constructor(config, game) {
		this.game = game;
		this.propagateDefinition(config);
		Object.assign(this, config);
	}

	propagateDefinition(property) {
 		if (property && property.constructor === GameProperty) {
 			property.definition = this;
 			return;
 		}
		if (Array.isArray(property)) {
			property.forEach(t => this.propagateDefinition(t));
			return;
		}
 		if (property && typeof(property) === 'object') {
 			for (let p in property) {
 				if (property.hasOwnProperty(p)) {
 					this.propagateDefinition(property[p]);
 				}
 			}
 			return;
 		}
 		console.error("Shouldn't reach this code.");
	}
}