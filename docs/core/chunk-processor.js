/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/*
	ChunkProcessor
*/


class ChunkProcessor {
	constructor(engine) {
		this.engine = engine;
	}

	process(sprite, chunk, now) {
		const { updateTimes } = sprite;
		const { glRenderer } = this.engine;

		sprite.updated = now;

		if (updateTimes.type === now) {
			chunk.setType(sprite.type, now);
		}

		if (updateTimes.tintColor === now) {
			chunk.setTint(sprite.tintColor, now);
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
			|| updateTimes.spriteSize === now || updateTimes.crop === now || updateTimes.circleRadius
			|| updateTimes.grid === now || updateTimes.padding) {
			const { src, spriteData: { spriteSize, grid, padding }, crop, scale, brightness, circleRadius } = sprite;

			if (!src) {
				chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
			} else {
				const spriteInfo = glRenderer.imagedata.sprites[src] || glRenderer.textureManager.getVideoTexture(src);
				if (!spriteInfo) {
					const error = `Unknown sprite ${src}.`;
					if (this.lastError !== error) {
						this.lastError = error;
						console.warn(this.lastError);
					}
					chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, crop, circleRadius, now);
					sprite.src = null;
					return;
				}

				const { rect: [ x, y, sheetWidth, sheetHeight ], index } = spriteInfo;

				const spriteDataProcessorInfo = this.engine.spriteDataProcessor.data[src];
				if (spriteDataProcessorInfo) {
					const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
					chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
				} else {
					const [ cols, rows ] = grid;
					const [ spriteWidth, spriteHeight ] = spriteSize;
					chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, crop, circleRadius, now);
				}
			}			
		}

		if (updateTimes.pos === now) {
			chunk.setOffset(sprite.pos, now);			
		}

		if (updateTimes.scale === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.hidden === now || updateTimes.corners === now) {
			const { scale, hotspot, hidden, corners, type } = sprite;
			if (hidden) {
				chunk.setHidden(now);
			} else {
				const spriteWidth = Math.abs(scale[0]);
				const spriteHeight = Math.abs(scale[1]);
				switch (type) {
					case SpriteType.Ceiling:
						chunk.setCeiling(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.Water:		
					case SpriteType.Floor:
					case SpriteType.Shadow:
						chunk.setFloor(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.LeftWall:
						chunk.setLeftWall(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.RightWall:
						chunk.setRightWall(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					case SpriteType.Sprite:
					case SpriteType.Front:
						chunk.setWall(spriteWidth, spriteHeight, hotspot, corners, now);			
						break;
					case SpriteType.Back:
						chunk.setBackWall(spriteWidth, spriteHeight, hotspot, corners, now);
						break;
					default:
						console.error("invalid type");
				}
			}
		}

		if (updateTimes.mov === now) {
			const [ mx, my, mz ] = sprite.mov;
			chunk.setMove(mx, my, mz, now);
		}

		if (updateTimes.gravity === now) {
			const [ gx, gy, gz ] = sprite.gravity;
			chunk.setGravity(gx, gy, gz, now);
		}		
	}
}
