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
	constructor() {
		this.id = null;
		this.providerIndex = -1;
		this.definitionIndex = -1;
		this.instanceIndex = -1;
		this.chunkIndex = -1;
		this.type = -1;
		this.hidden = false;
		this.updateTimes = {};
	}

	init() {
		this.lockedUntil = 0;
		this.updated = 0;
		this.skipProcess = false;
	}

	shouldEvaluate(now) {
		return this.lockedUntil >= 0 && this.lockedUntil <= now;
	}

	getEvaluated(game, definition) {
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const { type, hidden, lockedUntil, dynamic, fixed } = definition;

		this.setHidden(hidden.get(instanceIndex), now);

		if (this.hidden) {
			return;
		}

		const newType = type.get(instanceIndex) || 0;
		if (this.forceAll || this.type !== newType) {
			this.type = newType;
			updateTimes.type = now;
		}

		const newLockedUntil = !dynamic || fixed.get(instanceIndex) ? -1 : lockedUntil.get(instanceIndex);
		if (this.forceAll || newLockedUntil !== this.lockedUntil) {
			this.lockedUntil = newLockedUntil;
		}
		this.skipProcess = false;
	}

	setHidden(value, now) {
		if (value !== this.hidden) {
			this.hidden = value;
			this.lockedUntil = 0;
			this.skipProcess = false;
			this.updateTimes.hidden = now;

			if (!this.hidden) {	//	force reinitialize
				this.forceAll = true;
			}
		}		
	}
}