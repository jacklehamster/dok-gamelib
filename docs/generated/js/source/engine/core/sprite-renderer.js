/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/*
	SpriteRenderer
*/


class SpriteRenderer {
	constructor(engine) {
		this.engine = engine;
	}

	processTexture(sprite, chunk, now) {
		const { glRenderer: { imagedata, textureManager }, data: { generated: { videos } } } = this.engine;
		const { src, spriteData: { spriteSize, grid, padding }, scale, effects: { brightness }, circleRadius } = sprite;

		if (!src) {
			chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, circleRadius, now);
		} else {
			const spriteDataProcessorInfo = this.engine.spriteDataProcessor.data[src];
			const spriteInfo = imagedata.sprites[src] || textureManager.getVideoTexture(src) || spriteDataProcessorInfo && imagedata.sprites[spriteDataProcessorInfo.src];
			if (!spriteInfo) {
				if (!videos[src]) {
					const error = `Unknown sprite '${src}'.`;
					if (this.lastError !== error) {
						this.lastError = error;
						console.warn(this.lastError);
					}
				}
				chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, circleRadius, now);
				sprite.src = null;
				return;
			}

			const { rect: [ x, y, sheetWidth, sheetHeight ], isVideo } = spriteInfo;
			const index = isVideo ? textureManager.getCurrentVideoTextureIndex() : spriteInfo.index;
			if (spriteDataProcessorInfo) {
				const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, circleRadius, now);
			} else {
				const [ cols, rows ] = grid;
				const [ spriteWidth, spriteHeight ] = spriteSize;
				chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, circleRadius, now);
			}
		}
	}

	processWall(sprite, chunk, now) {
		const { scale, hotspot, hidden, corners, rotation, effects, type } = sprite;
		if (hidden) {
			chunk.setHidden(now);
		} else {
			const spriteWidth = Math.abs(scale[0]);
			const spriteHeight = Math.abs(scale[1]);
			switch (type) {
				case SpriteType.Ceiling:
					chunk.setCeiling(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
					break;
				case SpriteType.Water:		
				case SpriteType.Floor:
				case SpriteType.Shadow:
					chunk.setFloor(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
					break;
				case SpriteType.LeftWall:
					chunk.setLeftWall(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
					break;
				case SpriteType.RightWall:
					chunk.setRightWall(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
					break;
				case SpriteType.Sprite:
				case SpriteType.Front:
					chunk.setWall(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);			
					break;
				case SpriteType.Back:
					chunk.setBackWall(spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
					break;
				default:
					console.error("invalid type");
			}
		}
	}

	render(sprite, chunk, now) {
		const { updateTimes, skipProcess } = sprite;

		sprite.updated = now;

		if (skipProcess) {
			return;
		}

		if (updateTimes.type === now) {
			chunk.setType(sprite.type, now);
		}

		if (updateTimes.tintColor === now || updateTimes.hue === now) {
			chunk.setTintAndHue(sprite.effects.tintColor, sprite.effects.hue, now);
		}

		if (updateTimes.grid === now) {
			const { grid: [ cols, rows ] } = sprite.spriteData;
			chunk.setGrid(cols, rows, now);
		}

		if (updateTimes.frameRate === now || updateTimes.animationRange === now) {
			const { animationRange: [ start, length ], spriteData: { frameRate } } = sprite;
			chunk.setAnimation(start, length, frameRate, now);
		}

		if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now
			|| updateTimes.spriteSize === now || updateTimes.circleRadius === now || updateTimes.grid === now || updateTimes.padding === now) {
			this.processTexture(sprite, chunk, now);
		}

		if (updateTimes.pos === now) {
			chunk.setOffset(sprite.pos, now);			
		}

		if (updateTimes.scale === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.curvature === now
			|| updateTimes.hidden === now || updateTimes.corners === now || updateTimes.rotation === now) {
			this.processWall(sprite, chunk, now);
		}

		if (updateTimes.motion === now) {
			const [ mx, my, mz ] = sprite.motion.mov;
			chunk.setMove(mx, my, mz, sprite.motion.time, now);
			const [ gx, gy, gz ] = sprite.motion.gravity;
			chunk.setGravity(gx, gy, gz, now);
		}

		// for (let i in updateTimes) {
		// 	if (updateTimes[i] === now) {
		// 		Log.status(i);
		// 	}
		// }
	}
}
