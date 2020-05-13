/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

class ISpriteRenderer {
	constructor(textureManager, engineCommunicator, spriteProvider, spriteDataProcessor, {imagedata, videos}) {
		this.engineCommunicator = engineCommunicator;
		this.spriteDataProcessor = spriteDataProcessor;
		this.imagedata = imagedata;
		this.spriteProvider = spriteProvider;
		this.videos = videos;
		this.vec3pool = new Pool(vec3.create, Utils.clear3);
		this.textureManager = textureManager;
		this.tempSprites = [];
		this.visibleChunks = 0;
		this.usedChunks = 0;
	}

	static compareSpriteChunk(spriteA, spriteB) {
		return spriteA.chunkIndex - spriteB.chunkIndex;		
	}

	clear() {
		//	remove unprocessed sprites
		this.spriteProvider.getSprites().forEach(sprite => sprite.setHidden(true));
	}

	sendSprites(sprites, now) {
		const { tempSprites, vec3pool, spriteProvider, spriteDataProcessor } = this;

		let visibleChunks = 0;

		//	ensure chunks
		tempSprites.length = 0;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			if (sprite.chunkIndex < 0) {
				sprite.chunkIndex = this.usedChunks++;
			}
			sprite.updated = now;
			if (!sprite.hidden) {
				visibleChunks = Math.max(sprite.chunkIndex + 1, visibleChunks);
			}
			if (!sprite.skipProcess) {
				tempSprites.push(sprite);
			}
		}
		tempSprites.sort(ISpriteRenderer.compareSpriteChunk);

		//	process types
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.type === now) {
				const { type } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.SPRITE_TYPE,
					sprite.chunkIndex * VERTICES_PER_SPRITE * SPRITE_TYPE_FLOAT_PER_VERTEX,
					type, type, type, type,
				);
			}
		}

		//	process offset
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.pos === now) {
				const {	pos: [ offsetX, offsetY, offsetZ ] } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.OFFSET,
					sprite.chunkIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX,
					offsetX, offsetY, offsetZ,
					offsetX, offsetY, offsetZ,
					offsetX, offsetY, offsetZ,
					offsetX, offsetY, offsetZ,
				);
			}
		}

		//	process tint color
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.tintColor === now || sprite.updateTimes.hue === now) {
				const { effects: { tintColor, hue } } = sprite;
				const color = tintColor & 0xFFFFFF;
				const mixRatio = Math.max(0, (tintColor / 0xFFFFFF) / 255);
				this.engineCommunicator.loadGLBuffer(BufferType.COLOR_EFFECT,
					sprite.chunkIndex * VERTICES_PER_SPRITE * TINT_FLOAT_PER_VERTEX,
					color, mixRatio, hue,
					color, mixRatio, hue,
					color, mixRatio, hue,
					color, mixRatio, hue,
				);
			}
		}

		//	process move and gravity
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.move === now || sprite.updateTimes.gravity === now) {
				const {	motion: {mov: [ mx, my, mz ], time, gravity: [ gx, gy, gz ] } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.MOVE,
					sprite.chunkIndex * VERTICES_PER_SPRITE * (MOVE_FLOAT_PER_VERTEX + GRAVITY_FLOAT_PER_VERTEX),
					mx, my, mz, time, gx, gy, gz,
					mx, my, mz, time, gx, gy, gz,
					mx, my, mz, time, gx, gy, gz,
					mx, my, mz, time, gx, gy, gz,
				);
			}
		}

		//	process grid
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.grid === now) {
				const { grid: [ cols, rows ] } = sprite.spriteData;
				this.engineCommunicator.loadGLBuffer(BufferType.GRID,
					sprite.chunkIndex * VERTICES_PER_SPRITE * GRID_FLOAT_PER_VERTEX,
					cols, rows,
					cols, rows,
					cols, rows,
					cols, rows,
				);
			}
		}

		//	process animation
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.frameRate === now || sprite.updateTimes.animationRange === now) {
				const { animationRange: [ start, range ], spriteData: { frameRate } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.ANIMATION,
					sprite.chunkIndex * VERTICES_PER_SPRITE * ANIMATION_FLOAT_PER_VERTEX,
					now, start, range, frameRate,
					now, start, range, frameRate,
					now, start, range, frameRate,
					now, start, range, frameRate,
				);

			}
		}

		//	process blackhole center
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.blackholeCenter === now || sprite.updateTimes.blackholeInfo === now) {
				const { effects: { blackhole: { strength, distance, center: [ gx, gy, gz ] } } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.BLACKHOLE_CENTER,
					sprite.chunkIndex * VERTICES_PER_SPRITE * (BLACKHOLE_CENTER_FLOAT_PER_VERTEX + BLACKHOLE_INFO_FLOAT_PER_VERTEX),
					gx, gy, gz, strength, distance,
					gx, gy, gz, strength, distance,
					gx, gy, gz, strength, distance,
					gx, gy, gz, strength, distance,
				);
			}
		}

		//	process chroma key
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.chromaKey === now) {
				const { effects: { chromaKey: { range: [low, high], color }}} = sprite;
				const a = ((color >> 24) % 256) / 255;
				const rgb = color & 0xFFFFFF;
				this.engineCommunicator.loadGLBuffer(BufferType.CHROMA_KEY,
					sprite.chunkIndex * VERTICES_PER_SPRITE * CHROMA_KEY_FLOAT_PER_VERTEX,
					low, high, rgb, a,
					low, high, rgb, a,
					low, high, rgb, a,
					low, high, rgb, a,
				);						
			}					
		}

		//	process texture
		const { imagedata, textureManager, videos } = this;
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			const { updateTimes } = sprite;

			if (updateTimes.src === now || updateTimes.scale === now || updateTimes.brightness === now
				|| updateTimes.spriteSize === now || updateTimes.circleRadius === now || updateTimes.grid === now || updateTimes.padding === now
			) {
				const { src, spriteData: { spriteSize, grid, padding }, scale, effects: { brightness }, circleRadius } = sprite;
				if (!src) {
					this.setTexture(sprite, 0, 0, 0, 0, 0, scale, brightness, padding, 0, now);
				} else {
					const spriteDataProcessorInfo = spriteDataProcessor.data[src];
					const spriteInfo = imagedata.sprites[src] || textureManager.getVideoTexture(src) || spriteDataProcessorInfo && imagedata.sprites[spriteDataProcessorInfo.src];
					if (!spriteInfo) {
						if (!videos[src]) {
							const error = `Unknown sprite '${src}'.`;
							if (engine.lastError !== error) {
								engine.lastError = error;
								console.warn(engine.lastError);
							}
						}
						this.setTexture(sprite, 0, 0, 0, 0, 0, scale, brightness, padding, 0, now);
						sprite.src = null;
						continue;
					}

					const { rect: [ x, y, sheetWidth, sheetHeight ], isVideo } = spriteInfo;
					const index = isVideo ? VIDEO_TEXTURE_INDEX : spriteInfo.index;
					if (spriteDataProcessorInfo) {
						const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
						this.setTexture(sprite, index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, circleRadius, now);
					} else {
						const [ cols, rows ] = grid;
						const [ spriteWidth, spriteHeight ] = spriteSize;
						this.setTexture(sprite, index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, circleRadius, now);
					}
				}
			}
		}

		//	process wall
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			const { updateTimes } = sprite;
			if (updateTimes.scale === now || updateTimes.type === now || updateTimes.hotspot === now || updateTimes.curvature === now
				|| updateTimes.hidden === now || updateTimes.corners === now || updateTimes.rotation === now) {
				const { scale, hotspot, hidden, corners, rotation, effects, type } = sprite;
				if (hidden) {
					this.setInactive(sprite);
				} else {
					sprite.inactive = false;
					const spriteWidth = Math.abs(scale[0]);
					const spriteHeight = Math.abs(scale[1]);
					switch (type) {
						case SpriteType.Ceiling:
							this.setCeiling(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
							break;
						case SpriteType.Water:		
						case SpriteType.Floor:
						case SpriteType.Shadow:
							this.setFloor(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
							break;
						case SpriteType.LeftWall:
							this.setLeftWall(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
							break;
						case SpriteType.RightWall:
							this.setRightWall(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
							break;
						case SpriteType.Sprite:
						case SpriteType.Front:
							this.setWall(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);			
							break;
						case SpriteType.Back:
							this.setBackWall(sprite, spriteWidth, spriteHeight, hotspot, corners, rotation, effects, now);
							break;
						default:
							console.error("invalid type");
					}
					vec3pool.reset();					
				}				
			}
		}

		//	remove unprocessed sprites
		const hiddenSprites = spriteProvider.getSprites();
		for (let i = 0; i < hiddenSprites.length; i++) {
			const sprite = hiddenSprites[i];
			if (sprite.updated < now && !sprite.inactive) {
				this.setInactive(sprite);
			}
		}

		if (this.visibleChunks !== visibleChunks) {
			this.visibleChunks = visibleChunks;
	        this.engineCommunicator.sendInt(Commands.GL_SET_VISIBLE_CHUNKS, this.visibleChunks);
		}
	}

	setTexture(sprite, texIndex, spriteX, spriteY, spriteWidth, spriteHeight, scale, brightness, padding, circleRadius, now) {
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		const [ scaleH, scaleV ] = scale;
		const horizontalShift = texIndex * 2;
		const verticalShift = Math.round(brightness) * 2;

		let left = horizontalShift + texX + (padding * texWidth / 100),
			right = horizontalShift + texX + texWidth - (padding * texWidth / 100);
		let up = verticalShift + texY + (padding * texHeight / 100),
			down = verticalShift + texY + texHeight - (padding * texHeight / 100);

		if (scaleH < 0) {
			const temp = left;
			left = right;
			right = temp;
		}
		if (scaleV < 0) {
			const temp = up;
			up = down;
			down = temp;
		}

		const cx = (left % 2 + right % 2) / 2;
		const cy = (up % 2 + down % 2) / 2;
		const cwidth = circleRadius * Math.abs(left - right);
		const cheight = circleRadius * Math.abs(up - down);

		this.engineCommunicator.loadGLBuffer(BufferType.TEXCOORD,
			sprite.chunkIndex * VERTICES_PER_SPRITE * (TEXTURE_FLOAT_PER_VERTEX + TEXTURE_CENTER_PER_VERTEX),
			left,	up,		texWidth, texHeight, cx, cy, cwidth, cheight,
			left,	down,	texWidth, texHeight, cx, cy, cwidth, cheight,
			right,	down,	texWidth, texHeight, cx, cy, cwidth, cheight,
			right,	up,		texWidth, texHeight, cx, cy, cwidth, cheight,
		);
	}

	setInactive(sprite) {
		this.engineCommunicator.loadGLBuffer(BufferType.VERTEX,
			sprite.chunkIndex * VERTICES_PER_SPRITE * (FLOAT_PER_VERTEX + NORMAL_FLOAT_PER_VERTEX),
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0,
		);
		sprite.inactive = true;
	}

	getNormal(vertices, curvature, i) {
		const { vec3pool } = this;
		const vectorA = vec3.sub(vec3pool.get(), vertices[i], Utils.getFromArray(vertices, i + 1));
		const vectorB = vec3.sub(vec3pool.get(), vertices[i], Utils.getFromArray(vertices, i - 1));
		const cross = vec3.cross(vec3pool.get(), vectorA, vectorB);
		vec3.normalize(cross, cross);

		if (curvature !== 0) {
			const crossValue = vec3.scale(vec3pool.get(), cross, curvature);	
			const vectorA = vec3.sub(vec3pool.get(), vec3.add(vec3pool.get(), vertices[i], crossValue), Utils.getFromArray(vertices, i + 1));
			const vectorB = vec3.sub(vec3pool.get(), vec3.add(vec3pool.get(), vertices[i], crossValue), Utils.getFromArray(vertices, i - 1));
			const newCross = vec3.cross(vec3pool.get(), vectorA, vectorB);
			vec3.normalize(newCross, newCross);
			return newCross;
		} else {
			return cross;
		}
	}

	assignVertices(sprite, now, { angle, center }, { curvature }, ... vertices) {
		const { vec3pool } = this;

 		const [ angleX, angleY, angleZ ] = angle;
 		const deg2rad = 180 / Math.PI;
 		const quaternion = quat.fromEuler(quat.create(), angleX * deg2rad, angleY * deg2rad, angleZ * deg2rad);
 		for (let i = 0; i < vertices.length; i++) {
 			const newVec3 = vec3pool.get();
 			vec3.sub(newVec3, vertices[i], center);
			vec3.transformQuat(newVec3, newVec3, quaternion);
 			vec3.add(newVec3, newVec3, center);
 			vertices[i] = newVec3;
 		}
		this.engineCommunicator.loadGLBuffer(BufferType.VERTEX,
			sprite.chunkIndex * VERTICES_PER_SPRITE * (FLOAT_PER_VERTEX + NORMAL_FLOAT_PER_VERTEX),
			... vertices[0], ... this.getNormal(vertices, curvature, 0),
			... vertices[1], ... this.getNormal(vertices, curvature, 1),
			... vertices[2], ... this.getNormal(vertices, curvature, 2),
			... vertices[3], ... this.getNormal(vertices, curvature, 3),
		);
	}

	setWall(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
	}

	setBackWall(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
	}

	setFloor(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, - halfHeight - hotspotY * height),
		);
	}

	setCeiling(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, + halfHeight - hotspotY * height),
		);
	}

	setLeftWall(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
		);
	}

	setRightWall(sprite, width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(sprite, now, rotation, effects,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
		);
	}

	setVisibleChunks(count) {
		this.visibleChunks = count;
	}
}