/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	ImageSprite
 */

class ImageSpriteInstance extends BaseSpriteInstance {
 	constructor() {
 		super();
		this.src = null;
		this.tintColor = 0;
		this.brightness = 0;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src, tintColor } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const spriteSrc = src.get(instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			updateTimes.src = now;
		}

		const newTintColor = tintColor.get(instanceIndex);
		if (newTintColor !== this.tintColor) {
			this.tintColor = newTintColor;
			updateTimes.tintColor = now;
		}
	}
}