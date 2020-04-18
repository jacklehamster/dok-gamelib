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
		this.animationData = {
			spriteSize: [ 0, 0 ],
			grid: [ 0, 0 ],
			padding: 0,
			frameRate: 0,
			animations: {},
			first: null,
		};
		this.crop = [0, 0];
		this.circleRadius = 0;
		this.animationRange = [0, 0];
		this.animationUpdateTime = 0;
		this.singleFrameAnimation = false;
	}

	getEvaluated(game, definition) {
		super.getEvaluated(game, definition);
		if (this.hidden) {
			return;
		}

		const { animation, grid, brightness, padding, spriteSize, crop, circleRadius, animationOverride } = definition;
		const { instanceIndex, updateTimes, animationData, src } = this;
		const { now } = game;

		const cropX = crop[0].get(instanceIndex);
		const cropY = crop[1].get(instanceIndex);
		const cropWidth = crop[2].get(instanceIndex);
		const cropHeight = crop[3].get(instanceIndex);
		if (!Utils.equal4(this.crop, cropX, cropY, cropWidth, cropHeight)) {
			Utils.set4(this.crop, cropX, cropY, cropWidth, cropHeight);
			updateTimes.crop = now;
		}		

		const newBrightness = brightness.get(instanceIndex);
		if (newBrightness !== this.brightness) {
			this.brightness = newBrightness;
			updateTimes.brightness = now;
		}

		const newCircleRadius = circleRadius.get(instanceIndex);
		if (newCircleRadius !== this.circleRadius) {
			this.circleRadius = newCircleRadius;
			updateTimes.circleRadius = now;
		}

		const animationOverrideActive = animationOverride.active.get();

		const animationProcessorData = game.engine.animationProcessor.data[src];
		if (animationProcessorData) {
			const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, frameRate, animations, first } = animationProcessorData;
			const newPadding = padding;
			if (newPadding !== animationData.padding) {
				animationData.padding = newPadding;
				updateTimes.padding = now;
			}

			if (animationData.spriteSize[0] !== spriteWidth || animationData.spriteSize[1] !== spriteHeight) {
				animationData.spriteSize[0] = spriteWidth;
				animationData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			if (animationData.grid[0] !== cols || animationData.grid[1] !== rows) {
				animationData.grid[0] = cols;
				animationData.grid[1] = rows;
				updateTimes.grid = now;
			}

			const newFrameRate = animationOverrideActive ? animationOverride.frameRate.get(instanceIndex) : frameRate;
			if (animationData.frameRate !== newFrameRate) {
				animationData.frameRate = newFrameRate;
				updateTimes.frameRate = now;
				this.animationUpdateTime = now;
			}

			for (let a in animations) {
				if (!animationData.animations[a] || animations[a].timeUpdated === now) {
					animationData.animations[a] = animations[a];
					updateTimes.animations = now;
				}
			}

			for (let a in animationData.animations) {
				if (!animations[a]) {
					delete animationData.animations[a];
					updateTimes.animations = now;
				}
			}

			if (animationData.first !== first) {
				animationData.first = first;
				updateTimes.first = now;
			}
		} else {
			const newPadding = 0;
			if (newPadding !== animationData.padding) {
				animationData.padding = newPadding;
				updateTimes.padding = now;
			}

			const spriteWidth = 0, spriteHeight = 0;
			if (animationData.spriteSize[0] !== spriteWidth || animationData.spriteSize[1] !== spriteHeight) {
				animationData.spriteSize[0] = spriteWidth;
				animationData.spriteSize[1] = spriteHeight;
				updateTimes.spriteSize = now;
			}

			const animCols = 1;
			const animRows = 1;
			if (animationData.grid[0] !== animCols || animationData.grid[1] !== animRows) {
				animationData.grid[0] = animCols;
				animationData.grid[1] = animRows;
				updateTimes.grid = now;
			}

			const newFrameRate = animationOverrideActive ? animationOverride.frameRate.get(instanceIndex) : 0;
			if (animationData.frameRate !== newFrameRate) {
				animationData.frameRate = newFrameRate;
				updateTimes.frameRate = now;
				this.animationUpdateTime = now;
			}

			if (animationData.first !== null) {
				animationData.first = null;
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
			const newAnimation = animation.get(instanceIndex) || this.animationData.first;
			if (newAnimation !== this.animation) {
				this.singleFrameAnimation = !isNaN(newAnimation);
				this.animation = this.singleFrameAnimation ? parseInt(newAnimation) : newAnimation;
				this.animationUpdateTime = now;
			}

			if (this.singleFrameAnimation) {
				const newAnimationStart = this.animation;
				const newAnimationLength = 1;
				if (newAnimationStart !== this.animationRange[0] || newAnimationLength !== this.animationRange[1]) {
					this.animationRange[0] = newAnimationStart;
					this.animationRange[1] = newAnimationLength;
					updateTimes.animationRange = now;
				}
			} else {
				const animationFrame = Math.floor((now - this.animationUpdateTime) * animationData.frameRate / 1000);
				const animationList = animationData.animations[this.animation] ? animationData.animations[this.animation].animations : null;
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

	updateChunkGrid(chunk, now) {
		const { grid: [ cols, rows ] } = this.animationData;
		chunk.setGrid(cols, rows, now);
	}

	updateChunkTexture(renderer, chunk, now) {
		const { src, animationData: { spriteSize, grid, padding }, crop, scale, brightness, circleRadius } = this;

		if (!src) {
			chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
		} else {
			const spriteData = renderer.imagedata.sprites[src] || renderer.textureManager.getVideoTexture(src);
			if (!spriteData) {
				const error = `Unknown sprite ${src}.`;
				if (game.lastError !== error) {
					game.lastError = error;
					console.warn(game.lastError);
				}
				chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
				this.src = null;
				return;
			}

			const { rect: [ x, y, sheetWidth, sheetHeight ], index } = spriteData;

			const animationData = game.engine.animationProcessor.data[src];
			if (animationData) {
				const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = animationData;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
			} else {
				const [ cols, rows ] = grid;
				const [ spriteWidth, spriteHeight ] = spriteSize;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
			}
		}
	}

	updateChunkAnimation(chunk, now) {
		const { animationRange: [ start, length ], animationData: { frameRate } } = this;
		chunk.setAnimation(start, length, frameRate, now);
	}

	updateChunk(renderer, chunk, now) {
		super.updateChunk(renderer, chunk, now);
		const { updateTimes } = this;
		if (updateTimes.grid === now) {
			this.updateChunkGrid(chunk, now);
		}

		if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now
			|| updateTimes.spriteSize === now || updateTimes.crop === now || updateTimes.circleRadius
			|| updateTimes.grid === now || updateTimes.padding) {
			this.updateChunkTexture(renderer, chunk, now);
		}

		if (updateTimes.frameRate === now || updateTimes.animationRange === now) {
			this.updateChunkAnimation(chunk, now);
		}
	}
}