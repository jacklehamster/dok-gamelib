/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/**
  *	BaseSprite
  */

class BaseSpriteInstance {
	constructor(now) {
		this.providerIndex = -1;
		this.definitionIndex = -1;
		this.instanceIndex = -1;
		this.chunkIndex = -1;
		this.type = -1;
		this.hidden = false;
		this.updated = 0;
		this.updateTimes = {
		};
	}

	getEvaluated(game, definition) {
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const { type, hidden } = definition;

		this.setHidden(hidden.get(instanceIndex), now);

		if (this.hidden) {
			return;
		}

		const newType = type.get(instanceIndex) || 0;
		if (this.type !== newType) {
			this.type = newType;
			updateTimes.type = now;
		}
	}

	setHidden(value, now) {
		if (value !== this.hidden) {
			this.hidden = value;
			this.updateTimes.hidden = now;
		}		
	}
}