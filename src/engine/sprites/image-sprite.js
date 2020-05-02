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
		};
		this.isVideoSprite = false;
 	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}
		
		const { src, effects: { brightness, tintColor, curvature, hue, blackhole } } = definition;
		const { instanceIndex, updateTimes } = this;
		const { now } = game;
		const spriteSrc = src.get(instanceIndex);
		if (spriteSrc !== this.src) {
			this.src = spriteSrc;
			this.isVideoSprite = game.engine.data.generated.videos[this.src];
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

		const newHue = hue.get(instanceIndex);
		if (newHue !== this.effects.hue) {
			this.effects.hue = newHue;
			updateTimes.hue = now;
		}

		const newBlackholeCenterX = blackhole.center[0].get(instanceIndex);
		const newBlackholeCenterY = blackhole.center[1].get(instanceIndex);
		const newBlackholeCenterZ = blackhole.center[2].get(instanceIndex);
		if (!Utils.equal3(this.effects.blackhole.center, newBlackholeCenterX, newBlackholeCenterY, newBlackholeCenterZ)) {
			Utils.set3(this.effects.blackhole.center, newBlackholeCenterX, newBlackholeCenterY, newBlackholeCenterZ);
			updateTimes.blackholeCenter = now;
		}

		const newBlackholeStrength = blackhole.strength.get(instanceIndex);
		const newBlackholeDistance = blackhole.distance.get(instanceIndex);
		if (this.effects.blackhole.strength !== newBlackholeStrength || this.effects.blackhole.distance !== newBlackholeDistance) {
			this.effects.blackhole.strength = newBlackholeStrength;
			this.effects.blackhole.distance = newBlackholeDistance;
			updateTimes.blackholeInfo = now;
		}
	}
}