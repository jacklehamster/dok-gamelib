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

// 	static processTexture(sprite, chunk, now, engine) {
// 		const { glRenderer: { imagedata, textureManager }, data: { generated: { videos } } } = engine;
// 		const { src, spriteData: { spriteSize, grid, padding }, scale, effects: { brightness }, circleRadius } = sprite;

// 		if (!src) {
// //			Chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, now, chunk.bufferInfo.texCoord, chunk.index);
// 		} else {
// 			const spriteDataProcessorInfo = engine.spriteDataProcessor.data[src];
// 			const spriteInfo = imagedata.sprites[src] || textureManager.getVideoTexture(src) || spriteDataProcessorInfo && imagedata.sprites[spriteDataProcessorInfo.src];
// 			if (!spriteInfo) {
// 				if (!videos[src]) {
// 					const error = `Unknown sprite '${src}'.`;
// 					if (engine.lastError !== error) {
// 						engine.lastError = error;
// 						console.warn(engine.lastError);
// 					}
// 				}
// //				Chunk.setTexture(0, 0, 0, 0, 0, scale, brightness, padding, now, chunk.bufferInfo.texCoord, chunk.index);
// //				sprite.src = null;
// 				return;
// 			}

// 			const { rect: [ x, y, sheetWidth, sheetHeight ], isVideo } = spriteInfo;
// 			const index = isVideo ? textureManager.getCurrentVideoTextureIndex() : spriteInfo.index;
// 			if (spriteDataProcessorInfo) {
// 				const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
// //				Chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, now, chunk.bufferInfo.texCoord, chunk.index);
// 				Chunk.setTextureCenter(x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), padding, circleRadius, now, chunk.bufferInfo.texCenter, chunk.index);
// 			} else {
// 				const [ cols, rows ] = grid;
// 				const [ spriteWidth, spriteHeight ] = spriteSize;
// //				Chunk.setTexture(index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, now, chunk.bufferInfo.texCoord, chunk.index);
// 				Chunk.setTextureCenter(x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), padding, circleRadius, now, chunk.bufferInfo.texCenter, chunk.index);
// 			}
// 		}
// 	}

	static processWall(sprite, chunk, now) {
		const { scale, hotspot, hidden, corners, rotation, effects, type } = sprite;
		if (hidden) {
			chunk.setHidden(now, chunk.bufferInfo.vertex, chunk.index);
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

	static render(sprite, chunk, now, engine) {
		const { updateTimes, skipProcess } = sprite;

		sprite.updated = now;

		if (skipProcess) {
			return;
		}

		// if (updateTimes.type === now) {
		// 	Chunk.setType(sprite.type, now, chunk.bufferInfo.spriteType, chunk.index);
		// }

		// if (updateTimes.pos === now) {
		// 	Chunk.setOffset(sprite.pos, now, chunk.bufferInfo.offset, chunk.index);			
		// }

		// if (updateTimes.tintColor === now || updateTimes.hue === now) {
		// 	Chunk.setTintAndHue(sprite.effects.tintColor, sprite.effects.hue, now, chunk.bufferInfo.colorEffect, chunk.index);
		// }

		// if (updateTimes.move === now) {
		// 	const [ mx, my, mz ] = sprite.motion.mov;
		// 	Chunk.setMove(mx, my, mz, sprite.motion.time, now, chunk.bufferInfo.move, chunk.index);
		// }

		// if (updateTimes.gravity === now) {
		// 	const [ gx, gy, gz ] = sprite.motion.gravity;
		// 	Chunk.setGravity(gx, gy, gz, now, chunk.bufferInfo.gravity, chunk.index);			
		// }

		// if (updateTimes.grid === now) {
		// 	const { grid: [ cols, rows ] } = sprite.spriteData;
		// 	Chunk.setGrid(cols, rows, now, chunk.bufferInfo.grid, chunk.index);
		// }

		// if (updateTimes.frameRate === now || updateTimes.animationRange === now) {
		// 	const { animationRange: [ start, length ], spriteData: { frameRate } } = sprite;
		// 	Chunk.setAnimation(start, length, frameRate, now, chunk.bufferInfo.animation, chunk.index);
		// }

		// if (updateTimes.blackholeCenter === now) {
		// 	Chunk.setBlackholeCenter(sprite.effects.blackhole.center, now, chunk.bufferInfo.blackholeCenter, chunk.index);
		// }

		// if (updateTimes.blackholeInfo === now) {
		// 	Chunk.setBlackholeInfo(sprite.effects.blackhole.strength, sprite.effects.blackhole.distance, now, chunk.bufferInfo.blackholeInfo, chunk.index);
		// }

		// if (updateTimes.chromaKey === now) {
		// 	Chunk.setChromaKey(sprite.effects.chromaKey.range, sprite.effects.chromaKey.color, now, chunk.bufferInfo.chromaKey, chunk.index);
		// }

		// if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now
		// 	|| updateTimes.spriteSize === now || updateTimes.circleRadius === now || updateTimes.grid === now || updateTimes.padding === now) {
		// 	SpriteRenderer.processTexture(sprite, chunk, now, engine);
		// }

		// if (updateTimes.scale === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.curvature === now
		// 	|| updateTimes.hidden === now || updateTimes.corners === now || updateTimes.rotation === now || updateTimes.blackhole === now) {
		// 	SpriteRenderer.processWall(sprite, chunk, now);
		// }
	}
}
