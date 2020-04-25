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
		this.effects = {
			tintColor: 0,
			brightness: 0,
			curvature: 0,
		};
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src, effects: { brightness, tintColor, curvature } } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const spriteSrc = src.get(instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			updateTimes.src = now;
		}

		const newBrightness = brightness.get(instanceIndex);
		if (newBrightness !== this.effects.brightness) {
			this.effects.brightness = newBrightness;
			updateTimes.brightness = now;
		}

		const newTintColor = tintColor.get(instanceIndex);
		if (newTintColor !== this.effects.tintColor) {
			this.effects.tintColor = newTintColor;
			updateTimes.tintColor = now;
		}

		const newCurvature = curvature.get(instanceIndex);
		if (newCurvature !== this.effects.curvature) {
			this.effects.curvature = newCurvature;
			updateTimes.curvature = now;
		}
	}
}