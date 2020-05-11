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
	constructor(canvas, webgl, mediaManager, spriteRenderer, spritesheetManager, engineCommunicator, {imagedata, game, videos}) {
		const resolution = devicePixelRatio;
		canvas.width = game.width * resolution;
		canvas.height = game.height * resolution;
		canvas.style.width = `${canvas.width / resolution}px`;
		canvas.style.height = `${canvas.height / resolution}px`;

		this.spriteRenderer = spriteRenderer;

		const { vertexShader, fragmentShader } = webgl;
		this.canvas = canvas;
		this.webGLOptions = {
			antialias: false,
			preserveDrawingBuffer: false,
			alpha: false,
			depth: true,
			stencil: false,
			desynchronized: true,
			premultipliedAlpha: true,
		};
		this.gl = canvas.getContext("webgl", this.webGLOptions);
		this.spritesheetManager = spritesheetManager;
		this.engineCommunicator = engineCommunicator;

		this.checkSupport();
		this.extensions = this.applyExtensions();

		const { gl } = this;
		//	initialize gl
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

		gl.cullFace(gl.BACK);
		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	

		this.imagedata = imagedata;
		this.videos = videos;
		this.pool = {
			vec3forChunk: new Pool(vec3.create, Utils.clear3), 
		};

		this.shader = new Shader(gl, vertexShader, fragmentShader);

		this.bufferInfo = {
			spriteType: 	new EngineBuffer(BufferType.SPRITE_TYPE, this.shader, "spriteType", SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			vertex: 		new EngineBuffer(BufferType.VERTEX, this.shader, "vertex", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			offset: 		new EngineBuffer(BufferType.OFFSET, this.shader, "offset", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			normal: 		new EngineBuffer(BufferType.NORMAL, this.shader, "normal", NORMAL_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			move: 			new EngineBuffer(BufferType.MOVE, this.shader, "move", MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			gravity: 		new EngineBuffer(BufferType.GRAVITY, this.shader, "gravity", GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCoord: 		new EngineBuffer(BufferType.TEXCOORD, this.shader, "texCoord", TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCenter: 		new EngineBuffer(BufferType.TEXCENTER, this.shader, "texCenter", TEXTURE_CENTER_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			animation: 		new EngineBuffer(BufferType.ANIMATION, this.shader, "animation", ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			grid: 			new EngineBuffer(BufferType.GRID, this.shader, "grid", GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			colorEffect: 	new EngineBuffer(BufferType.COLOR_EFFECT, this.shader, "colorEffect", TINT_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeCenter: new EngineBuffer(BufferType.BLACKHOLE_CENTER, this.shader, "blackholeCenter", BLACKHOLE_CENTER_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeInfo:  new EngineBuffer(BufferType.BLACKHOLE_INFO, this.shader, "blackholeInfo", BLACKHOLE_INFO_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			chromaKey: 		new EngineBuffer(BufferType.CHROMA_KEY, this.shader, "chromaKey", CHROMA_KEY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
		};

		this.bufferInfos = [];
		for (let i in this.bufferInfo) {
			this.bufferInfos[this.bufferInfo[i].type] = this.bufferInfo[i];
		}

		this.boundBuffer = null;

		this.mediaManager = mediaManager;
		this.textureManager = new TextureManager(gl, mediaManager);

		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
		this.chunks = new Array(MAX_SPRITE).fill(null).map((a, index) => new Chunk(index, this.bufferInfo, this.pool.vec3forChunk));
		this.usedChunks = 0;
		this.visibleChunks = 0;

		this.spriteIndices = new Array(MAX_SPRITE).fill(null);
		this.tempSprites = [];

		//	load texture
		this.spritesheetManager.fetchImages(
			progress => console.log(progress.toFixed(2) + "%"),
			images => images.forEach((image, index) => this.textureManager.setImage(index, image)),
			errors => console.error(errors)
		);
	}

	checkSupport() {
		const { gl } = this;
		const settings = {
			maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
			maxVarying: gl.getParameter(gl.MAX_VARYING_VECTORS),
			maxUniform: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
			renderer: gl.getParameter(gl.RENDERER),
			version: gl.getParameter(gl.VERSION),
			renderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
		};
		console.info(settings);
	}

	applyExtensions() {
		const { gl } = this;
		return [
			gl.getExtension('OES_element_index_uint'),
		];
	}

	resetPools() {
		for (let p in this.pool) {
			this.pool[p].reset();
		}
	}

	newChunk() {
		if (this.usedChunks < this.chunks.length) {
			const index = this.usedChunks++;
			return this.chunks[index];			
		}
		return null;
	}

	setTime(now) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.now, now);
	}

	clearScreen() {
		const { gl } = this;
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	}

	getChunkFor(sprite) {
		let chunk;
		if (sprite.chunkIndex < 0) {
			chunk = this.newChunk();
			if (chunk) {
				sprite.chunkIndex = chunk.index;
				this.spriteIndices[sprite.chunkIndex] = sprite;
			} else if (!this.tooManySpriteError) {
				this.tooManySpriteError = true;
				console.error("Too many sprites.");
			}
		} else {
			chunk = this.chunks[sprite.chunkIndex];
		}
		if (chunk) {
			this.visibleChunks = Math.max(this.visibleChunks, chunk.index + 1);
		}
		return chunk;		
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

	sendUpdatedBuffers(now) {
		const { bufferInfo } = this;
		for (let b in bufferInfo) {
			this.sendUpdatedBuffer(bufferInfo[b], now);
		}
	}

	sendUpdatedBuffer(engineBuffer, now) {
		const { usedChunks } = this;
		const { chunkUpdateTimes, skipSend } = engineBuffer;
		if (skipSend) {
			return;
		}

		for (let i = 0; i < usedChunks; i++) {
			if (chunkUpdateTimes[i] === now) {
				this.sendBuffer(engineBuffer, i, i+1);
			}
		}



		// const HOLE_LIMIT = 4;
		// let rangeStart = -1, holeSize = 0;
		// for (let i = 0; i < usedChunks; i++) {
		// 	if (rangeStart < 0) {
		// 		if (chunkUpdateTimes[i] === now) {
		// 			rangeStart = i;
		// 		}
		// 	} else if (chunkUpdateTimes[i] !== now) {
		// 		holeSize++;
		// 		if (holeSize >= HOLE_LIMIT) {
		// 			this.sendBuffer(engineBuffer, rangeStart, i);
		// 			rangeStart = -1;
		// 			holeSize = 0;
		// 		}
		// 	}
		// }
		// if (rangeStart >= 0) {
		// 	this.sendBuffer(engineBuffer, rangeStart, usedChunks);
		// }
	}

	sendBuffer(engineBuffer, rangeStart, rangeEnd) {
		const { gl } = this;
		const { floatPerVertex, verticesPerSprite, type } = engineBuffer;
		this.sendBufferToGL(type, rangeStart * verticesPerSprite * floatPerVertex, engineBuffer.subarray(rangeStart, rangeEnd));
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
		const { gl, pool, spriteRenderer, spriteIndices, tempSprites } = this;

		//	ensure chunks
		tempSprites.length = 0;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			this.getChunkFor(sprite);
			if (!sprite.hidden && !sprite.skipProcess) {
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


		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			const chunk = this.getChunkFor(sprite);
			if (chunk && sprite.chunkIndex >= 0) {
				pool.vec3forChunk.reset();
				SpriteRenderer.render(sprite, chunk, now, spriteRenderer.engine);
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


	setTextureCenter(sprite, spriteX, spriteY, spriteWidth, spriteHeight, padding, circleRadius, now, engineBuffer, index) {
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

	draw(now) {
		const { gl } = this;
		this.sendUpdatedBuffers(now);
		gl.drawElements(gl.TRIANGLES, this.visibleChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_INT, 0);
		while (this.visibleChunks > 0 && this.chunks[this.visibleChunks-1].hidden) {
			this.visibleChunks--;
		}
	}
}
