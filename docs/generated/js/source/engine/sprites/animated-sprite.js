/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
  *		AnimatedSprite
  */

class AnimatedSpriteInstance extends ImageSpriteInstance {
	constructor() {
		super();
		this.animation = null;
		this.spriteData = {
			spriteSize: [ 0, 0 ],
			grid: [ 0, 0 ],
			padding: 0,
			frameRate: 0,
			animations: {},
			first: null,
		};
		this.circleRadius = 0;
		this.animationRange = [0, 0];
		this.animationUpdateTime = 0;
		this.singleFrameAnimation = true;
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { animation, grid, padding, spriteSize, circleRadius, animationOverride, frame } = definition;
		const { instanceIndex, updateTimes, spriteData, src } = this;
		const { now } = game;

		const newCircleRadius = circleRadius.get(instanceIndex);
		if (newCircleRadius !== this.circleRadius) {
			this.circleRadius = newCircleRadius;
			updateTimes.circleRadius = now;
		}

		const animationOverrideActive = animationOverride.active.get();

		const spriteDataProcessorInfo = game.engine.spriteDataProcessor.data[src];
		if (spriteDataProcessorInfo) {
			const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, frameRate, animations, first } = spriteDataProcessorInfo;
			const newPadding = padding;
			if (newPadding !== spriteData.padding) {
				spriteData.padding = newPadding;
				updateTimes.padding = now;
			}

			if (spriteData.spriteSize[0] !== spriteWidth || spriteData.spriteSize[1] !== spriteHeight) {
				spriteData.spriteSize[0] = spriteWidth;
				spriteData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			if (spriteData.grid[0] !== cols || spriteData.grid[1] !== rows) {
				spriteData.grid[0] = cols;
				spriteData.grid[1] = rows;
				updateTimes.grid = now;
			}

			const newFrameRate = animationOverrideActive ? animationOverride.frameRate.get(instanceIndex) : frameRate;
			if (spriteData.frameRate !== newFrameRate) {
				spriteData.frameRate = newFrameRate;
				updateTimes.frameRate = now;
				this.animationUpdateTime = now;
			}

			for (let a in animations) {
				if (!spriteData.animations[a] || animations[a].timeUpdated === now) {
					spriteData.animations[a] = animations[a];
					updateTimes.animations = now;
				}
			}

			for (let a in spriteData.animations) {
				if (!animations[a]) {
					delete spriteData.animations[a];
					updateTimes.animations = now;
				}
			}

			if (spriteData.first !== first) {
				spriteData.first = first;
				updateTimes.first = now;
			}
		} else {
			const newPadding = 0;
			if (newPadding !== spriteData.padding) {
				spriteData.padding = newPadding;
				updateTimes.padding = now;
			}

			const spriteWidth = 0, spriteHeight = 0;
			if (spriteData.spriteSize[0] !== spriteWidth || spriteData.spriteSize[1] !== spriteHeight) {
				spriteData.spriteSize[0] = spriteWidth;
				spriteData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			const animCols = 1;
			const animRows = 1;
			if (spriteData.grid[0] !== animCols || spriteData.grid[1] !== animRows) {
				spriteData.grid[0] = animCols;
				spriteData.grid[1] = animRows;
				updateTimes.grid = now;
			}

			const newFrameRate = animationOverrideActive ? animationOverride.frameRate.get(instanceIndex) : 0;
			if (spriteData.frameRate !== newFrameRate) {
				spriteData.frameRate = newFrameRate;
				updateTimes.frameRate = now;
				this.animationUpdateTime = now;
			}

			if (spriteData.first !== null) {
				spriteData.first = null;
			}			
		}

		if (animationOverrideActive) {
			const newAnimationStart = animationOverride.start.get(instanceIndex);
			const newAnimationLength = animationOverride.range.get(instanceIndex);
			if (newAnimationStart !== this.animationRange[0] || newAnimationLength !== this.animationRange[1]) {
				this.animationRange[0] = newAnimationStart;
				this.animationRange[1] = newAnimationLength;
				updateTimes.animationRange = now;
			}
		} else {
			const newAnimation = animation.get(instanceIndex) || this.spriteData.first;
			if (newAnimation !== this.animation) {
				this.singleFrameAnimation = !isNaN(newAnimation);
				this.animation = newAnimation;
				this.animationUpdateTime = now;
			}

			if (this.singleFrameAnimation) {
				const newAnimationStart = parseInt(this.animation || frame.get(instanceIndex));
				const newAnimationLength = 1;
				if (newAnimationStart !== this.animationRange[0] || newAnimationLength !== this.animationRange[1]) {
					this.animationRange[0] = newAnimationStart;
					this.animationRange[1] = newAnimationLength;
					updateTimes.animationRange = now;
				}
			} else {
				const animationFrame = Math.floor((now - this.animationUpdateTime) * spriteData.frameRate / 1000);
				const animationList = spriteData.animations[this.animation] ? spriteData.animations[this.animation].animations : null;
				const range = animationList ? animationList[animationFrame % animationList.length] : null;
				const newAnimationStart = range ? range[0] : 0;
				const newAnimationLength = range ? range[1] : 1;
				if (newAnimationStart !== this.animationRange[0] || newAnimationLength !== this.animationRange[1]) {
					this.animationRange[0] = newAnimationStart;
					this.animationRange[1] = newAnimationLength;
					updateTimes.animationRange = now;
				}
			}
		}
	}
}