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
			hue: 0,
			blackhole : {
				center: [0, 0, 0],
				strength: 0,
				distance: 0,
			},
			chromaKey: {
				range: [0, 0],
				color: 0,
			},
		};
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src, effects: { brightness, tintColor, curvature, hue, blackhole, chromaKey } } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const spriteSrc = src.get(instanceIndex);
		if (this.forceAll || spriteSrc !== this.src) {
			this.src = spriteSrc;
			updateTimes.src = now;
		}

		const newBrightness = brightness.get(instanceIndex);
		if (this.forceAll || newBrightness !== this.effects.brightness) {
			this.effects.brightness = newBrightness;
			updateTimes.brightness = now;
		}

		const newTintColor = tintColor.get(instanceIndex);
		if (this.forceAll || newTintColor !== this.effects.tintColor) {
			this.effects.tintColor = newTintColor;
			updateTimes.tintColor = now;
		}

		const newCurvature = curvature.get(instanceIndex);
		if (this.forceAll || newCurvature !== this.effects.curvature) {
			this.effects.curvature = newCurvature;
			updateTimes.curvature = now;
		}

		const newHue = hue.get(instanceIndex);
		if (this.forceAll || newHue !== this.effects.hue) {
			this.effects.hue = newHue;
			updateTimes.hue = now;
		}

		const newBlackholeCenterX = blackhole.center[0].get(instanceIndex);
		const newBlackholeCenterY = blackhole.center[1].get(instanceIndex);
		const newBlackholeCenterZ = blackhole.center[2].get(instanceIndex);
		if (this.forceAll || !Utils.equal3(this.effects.blackhole.center, newBlackholeCenterX, newBlackholeCenterY, newBlackholeCenterZ)) {
			Utils.set3(this.effects.blackhole.center, newBlackholeCenterX, newBlackholeCenterY, newBlackholeCenterZ);
			updateTimes.blackholeCenter = now;
		}

		const newBlackholeStrength = blackhole.strength.get(instanceIndex);
		const newBlackholeDistance = blackhole.distance.get(instanceIndex);
		if (this.forceAll || this.effects.blackhole.strength !== newBlackholeStrength || this.effects.blackhole.distance !== newBlackholeDistance) {
			this.effects.blackhole.strength = newBlackholeStrength;
			this.effects.blackhole.distance = newBlackholeDistance;
			updateTimes.blackholeInfo = now;
		}

		const newChromaKeyLow = chromaKey.range[0].get(instanceIndex);
		const newChromaKeyHigh = chromaKey.range[1].get(instanceIndex);
		const newChromaKeyColor = chromaKey.color.get(instanceIndex);
		if (this.forceAll || this.effects.chromaKey.range[0] !== newChromaKeyLow || this.effects.chromaKey.range[1] !== newChromaKeyHigh ||
			this.effects.chromaKey.color !== newChromaKeyColor) {
			this.effects.chromaKey.range[0] = newChromaKeyLow;
			this.effects.chromaKey.range[1] = newChromaKeyHigh;
			this.effects.chromaKey.color = newChromaKeyColor;
			updateTimes.chromaKey = now;
		}
	}
}