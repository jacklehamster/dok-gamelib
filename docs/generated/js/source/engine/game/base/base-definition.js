/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	BaseDefinition
 */

class BaseDefinition {
	constructor(config, game) {
		this.game = game;
		this.dynamic = false;
		this.propagateDefinition(config);
		Object.assign(this, config);
		this.refreshing = this.refresh.dynamic;
		if (this.refreshing) {
			this.lastRefresh = 0;
		}
	}

	propagateDefinition(property) {
 		if (property && property.constructor === GameProperty) {
 			property.definition = this;
 			if (property.dynamic) {
 				this.dynamic = true;
 			}
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