/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
GLRenderer Engine


*/

class GLRenderer {
	constructor(gl, textureManager, webgl, engineCommunicator, spriteProvider, {imagedata, videos}) {
		this.spriteProvider = spriteProvider;

		const { vertexShader, fragmentShader } = webgl;
		this.gl = gl;
		this.engineCommunicator = engineCommunicator;
		this.imagedata = imagedata;
		this.videos = videos;
		this.vec3pool = new Pool(vec3.create, Utils.clear3);
		this.shader = new Shader(this.gl, vertexShader, fragmentShader);
		this.textureManager = textureManager;

		const bufferInfo = {
			spriteType: 	new EngineBuffer(BufferType.SPRITE_TYPE, 		this.shader, "spriteType", SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			vertex: 		new EngineBuffer(BufferType.VERTEX, 			this.shader, "vertex", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			offset: 		new EngineBuffer(BufferType.OFFSET, 			this.shader, "offset", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			normal: 		new EngineBuffer(BufferType.NORMAL, 			this.shader, "normal", NORMAL_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			move: 			new EngineBuffer(BufferType.MOVE, 				this.shader, "move", MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			gravity: 		new EngineBuffer(BufferType.GRAVITY, 			this.shader, "gravity", GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCoord: 		new EngineBuffer(BufferType.TEXCOORD, 			this.shader, "texCoord", TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCenter: 		new EngineBuffer(BufferType.TEXCENTER, 			this.shader, "texCenter", TEXTURE_CENTER_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			animation: 		new EngineBuffer(BufferType.ANIMATION, 			this.shader, "animation", ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			grid: 			new EngineBuffer(BufferType.GRID, 				this.shader, "grid", GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			colorEffect: 	new EngineBuffer(BufferType.COLOR_EFFECT, 		this.shader, "colorEffect", TINT_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeCenter: new EngineBuffer(BufferType.BLACKHOLE_CENTER, 	this.shader, "blackholeCenter", BLACKHOLE_CENTER_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeInfo:  new EngineBuffer(BufferType.BLACKHOLE_INFO, 	this.shader, "blackholeInfo", BLACKHOLE_INFO_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			chromaKey: 		new EngineBuffer(BufferType.CHROMA_KEY, 		this.shader, "chromaKey", CHROMA_KEY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
		};

		this.bufferInfos = [];
		for (let i in bufferInfo) {
			this.bufferInfos[bufferInfo[i].type] = bufferInfo[i];
		}

		this.boundBuffer = null;

		this.usedChunks = 0;
		this.visibleChunks = 0;

		this.tempSprites = [];
	}

	bindBuffer(shaderBuffer) {
		if (this.boundBuffer === shaderBuffer) {
			return;
		}
		const { gl } = this;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);
		this.boundBuffer = shaderBuffer;
	}

	sendBufferToGL(type, offset, buffer) {
		const { gl, bufferInfos } = this;
		this.bindBuffer(bufferInfos[type].shaderBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, buffer);
	}

	static compareSpriteChunk(spriteA, spriteB) {
		return spriteA.chunkIndex - spriteB.chunkIndex;		
	}

	sendSprites(sprites, now) {
		const { gl, tempSprites, vec3pool, spriteProvider } = this;

		this.visibleChunks = 0;

		//	ensure chunks
		tempSprites.length = 0;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			if (sprite.chunkIndex < 0) {
				sprite.chunkIndex = this.usedChunks++;
			}
			sprite.updated = now;
			if (!sprite.hidden) {
				this.visibleChunks = Math.max(sprite.chunkIndex + 1, this.visibleChunks);
			}
			if (!sprite.skipProcess) {
				tempSprites.push(sprite);
			}
		}
		tempSprites.sort(GLRenderer.compareSpriteChunk);

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
					color, mixRatio, hue, 0,
					color, mixRatio, hue, 0,
					color, mixRatio, hue, 0,
					color, mixRatio, hue, 0,
				);
			}
		}

		//	process move
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.move === now) {
				const {	motion: {mov: [ mx, my, mz ], time } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.MOVE,
					sprite.chunkIndex * VERTICES_PER_SPRITE * MOVE_FLOAT_PER_VERTEX,
					mx, my, mz, time,
					mx, my, mz, time,
					mx, my, mz, time,
					mx, my, mz, time,
				);
			}
		}

		//	process gravity
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.gravity === now) {
				const {	motion: {gravity: [ gx, gy, gz ] } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.GRAVITY,
					sprite.chunkIndex * VERTICES_PER_SPRITE * GRAVITY_FLOAT_PER_VERTEX,
					gx, gy, gz,
					gx, gy, gz,
					gx, gy, gz,
					gx, gy, gz,
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
			if (sprite.updateTimes.blackholeCenter === now) {
				const { effects: { blackhole: { center: [ gx, gy, gz ] } } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.BLACKHOLE_CENTER,
					sprite.chunkIndex * VERTICES_PER_SPRITE * BLACKHOLE_CENTER_FLOAT_PER_VERTEX,
					gx, gy, gz,
					gx, gy, gz,
					gx, gy, gz,
					gx, gy, gz,
				);
			}
		}

		//	process blackhole info
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			if (sprite.updateTimes.blackholeInfo === now) {
				const { effects: { blackhole: { strength, distance } } } = sprite;
				this.engineCommunicator.loadGLBuffer(BufferType.BLACKHOLE_INFO,
					sprite.chunkIndex * VERTICES_PER_SPRITE * BLACKHOLE_INFO_FLOAT_PER_VERTEX,
					strength, distance,
					strength, distance,
					strength, distance,
					strength, distance,
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
				|| updateTimes.spriteSize === now || updateTimes.grid === now || updateTimes.padding === now
			) {
				const { src, spriteData: { spriteSize, grid, padding }, scale, effects: { brightness } } = sprite;
				if (!src) {
					this.setTexture(sprite, 0, 0, 0, 0, 0, scale, brightness, padding, now);
				} else {
					const spriteDataProcessorInfo = engine.spriteDataProcessor.data[src];
					const spriteInfo = imagedata.sprites[src] || textureManager.getVideoTexture(src) || spriteDataProcessorInfo && imagedata.sprites[spriteDataProcessorInfo.src];
					if (!spriteInfo) {
						if (!videos[src]) {
							const error = `Unknown sprite '${src}'.`;
							if (engine.lastError !== error) {
								engine.lastError = error;
								console.warn(engine.lastError);
							}
						}
						this.setTexture(sprite, 0, 0, 0, 0, 0, scale, brightness, padding, now);
						sprite.src = null;
						continue;
					}

					const { rect: [ x, y, sheetWidth, sheetHeight ], isVideo } = spriteInfo;
					const index = isVideo ? textureManager.getCurrentVideoTextureIndex() : spriteInfo.index;
					if (spriteDataProcessorInfo) {
						const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
						this.setTexture(sprite, index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, now);
					} else {
						const [ cols, rows ] = grid;
						const [ spriteWidth, spriteHeight ] = spriteSize;
						this.setTexture(sprite, index, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), scale, brightness, padding, now);
					}
				}
			}
		}

		//	process texture center
		for (let i = 0; i < tempSprites.length; i++) {
			const sprite = tempSprites[i];
			const { updateTimes } = sprite;
			if (updateTimes.src === now
				|| updateTimes.spriteSize === now || updateTimes.circleRadius === now || updateTimes.grid === now || updateTimes.padding === now) {
				const { src, spriteData: { spriteSize, grid, padding }, circleRadius } = sprite;

				if (src) {
					const spriteDataProcessorInfo = engine.spriteDataProcessor.data[src];
					const spriteInfo = imagedata.sprites[src] || textureManager.getVideoTexture(src) || spriteDataProcessorInfo && imagedata.sprites[spriteDataProcessorInfo.src];
					if (!spriteInfo) {
						if (!videos[src]) {
							const error = `Unknown sprite '${src}'.`;
							if (engine.lastError !== error) {
								engine.lastError = error;
								console.warn(engine.lastError);
							}
						}
						continue;
					}

					const { rect: [ x, y, sheetWidth, sheetHeight ] } = spriteInfo;
					if (spriteDataProcessorInfo) {
						const { spriteSize: [ spriteWidth, spriteHeight ], grid: [ cols, rows ], padding, animations } = spriteDataProcessorInfo;
						this.setTextureCenter(sprite, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), padding, circleRadius, now);
					} else {
						const [ cols, rows ] = grid;
						const [ spriteWidth, spriteHeight ] = spriteSize;
						this.setTextureCenter(sprite, x, y, spriteWidth || (sheetWidth / cols), spriteHeight || (sheetHeight / rows), padding, circleRadius, now);
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
					this.setHidden(sprite);
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
				this.setHidden(sprite);
			}
		}
	}

	setTexture(sprite, texIndex, spriteX, spriteY, spriteWidth, spriteHeight, scale, brightness, padding, now) {
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

		this.engineCommunicator.loadGLBuffer(BufferType.TEXCOORD,
			sprite.chunkIndex * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX,
			left,	up,		texWidth,	texHeight,
			left,	down,	texWidth,	texHeight,
			right,	down,	texWidth,	texHeight,
			right,	up,		texWidth,	texHeight,
		);
	}	

	setTextureCenter(sprite, spriteX, spriteY, spriteWidth, spriteHeight, padding, circleRadius, now) {
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;

		let left = texX + (padding * texWidth / 100),
			right = texX + texWidth - (padding * texWidth / 100);
		let up = texY + (padding * texHeight / 100),
			down = texY + texHeight - (padding * texHeight / 100);

		this.engineCommunicator.loadGLBuffer(BufferType.TEXCENTER,
			sprite.chunkIndex * VERTICES_PER_SPRITE * TEXTURE_CENTER_PER_VERTEX,
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
		);
	}

	setHidden(sprite) {
		this.engineCommunicator.loadGLBuffer(BufferType.VERTEX,
			sprite.chunkIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		);
		sprite.inactive = true;
	}


	applyNormal(sprite, vertices, curvature, i) {
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
			this.engineCommunicator.loadGLBuffer(BufferType.NORMAL,
				sprite.chunkIndex * VERTICES_PER_SPRITE * NORMAL_FLOAT_PER_VERTEX,
				... newCross,
			);
		} else {
			this.engineCommunicator.loadGLBuffer(BufferType.NORMAL,
				sprite.chunkIndex * VERTICES_PER_SPRITE * NORMAL_FLOAT_PER_VERTEX,
				... cross,
			);
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
			sprite.chunkIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX,
			... vertices[0],
			... vertices[1],
			... vertices[2],
			... vertices[3],
		);

		for (let i = 0; i < vertices.length; i++) {
			this.applyNormal(sprite, vertices, curvature, i);
		}
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

	draw(now) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.now, now);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, this.visibleChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_INT, 0);
	}
}
