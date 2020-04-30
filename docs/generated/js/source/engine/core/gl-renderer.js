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
	constructor(canvas, webgl, mediaManager, spriteRenderer, spritesheetManager, {imagedata, game}) {
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

		this.checkSupport();

		const { gl } = this;
		//	initialize gl
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

		gl.cullFace(gl.BACK);
		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	

		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.imagedata = imagedata;
		this.pool = {
			vec3: new Pool(vec3.create, Utils.clear3),
			quat: new Pool(quat.create, quat.identity),
			mat4: new Pool(mat4.create, mat4.identity),
			vec3forChunk: new Pool(vec3.create, Utils.clear3), 
		};

		this.shader = new Shader(gl, vertexShader, fragmentShader);

		this.bufferInfo = {
			vertex: 		new EngineBuffer(this.shader, "vertex", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			offset: 		new EngineBuffer(this.shader, "offset", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			normal: 		new EngineBuffer(this.shader, "normal", NORMAL_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			move: 			new EngineBuffer(this.shader, "move", MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			gravity: 		new EngineBuffer(this.shader, "gravity", GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			spriteType: 	new EngineBuffer(this.shader, "spriteType", SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			texCoord: 		new EngineBuffer(this.shader, "texCoord", TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			texCenter: 		new EngineBuffer(this.shader, "texCenter", TEXTURE_CENTER_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			animation: 		new EngineBuffer(this.shader, "animation", ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			grid: 			new EngineBuffer(this.shader, "grid", GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			colorEffect: 	new EngineBuffer(this.shader, "colorEffect", TINT_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
		};

		this.mediaManager = mediaManager;
		this.textureManager = new TextureManager(gl, this.shader, mediaManager);

		const { shader, textureManager } = this;

		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
		this.chunks = new Array(MAX_SPRITE).fill(null).map((a, index) => new Chunk(index, this.bufferInfo, this.pool.vec3forChunk));
		this.usedChunks = 0;

		//	load texture
		this.spritesheetManager.fetchImages(
			progress => console.log(progress.toFixed(2) + "%"),
			images => images.forEach((image, index) => this.textureManager.setImage(index, image)),
			errors => console.error(errors)
		);

		this.lastRefresh = 0;
		this.progress = 0;
		this.cycle = 0;
	}

	checkSupport() {
		const { gl } = this;
		const settings = {
			maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
			maxVarying: gl.getParameter(gl.MAX_VARYING_VECTORS),
			maxUniform: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
		};
		console.info(settings);
	}

	resetPools() {
		for (let p in this.pool) {
			this.pool[p].reset();
		}
	}

	newChunk() {
		return this.usedChunks >= this.chunks.length ? null : this.chunks[this.usedChunks++];
	}

	setBackground(color) {
		const { gl, shader, canvas } = this;
		color = color || 0;
		const a = 1 - ((color >> 24) % 256) / 256;
		const r = ((color >> 16) % 256) / 256;
		const g = ((color >> 8) % 256) / 256;
		const b = ((color) % 256) / 256;
		gl.uniform4f(shader.programInfo.background, r, g, b, a);
		gl.clearColor(r, g, b, 1.0);
		canvas.style.backgroundColor = Utils.getDOMColor(color);
	}

	setViewAngle(viewAngle, near, far) {
		if (near <= 0) {
			console.error(`Invalid range [near, far]. Near needs to be higher than 0.`);
		}
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, near, far);
		gl.uniformMatrix4fv(shader.programInfo.projection, false, projectionMatrix);
	}

	setViewPosition(x, y, z, tilt, turn, cameraDistance) {
		const { gl, shader, viewMatrix, pool } = this;
		const scale = 1;
		const zOffset = cameraDistance;	//	camera distance
		const cameraQuat = pool.quat.get();
		const cameraRotationMatrix = pool.mat4.get();
		quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
		mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3,
			Utils.set3(pool.vec3.get(), scale, scale, scale),
			Utils.set3(pool.vec3.get(), 0, -tilt * 2, zOffset));
		quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites			
		mat4.translate(viewMatrix, viewMatrix, Utils.set3(pool.vec3.get(), -x, -y, -z + zOffset));

		mat4.fromQuat(cameraRotationMatrix, cameraQuat);
		gl.uniformMatrix4fv(shader.programInfo.view, false, viewMatrix);
		gl.uniformMatrix4fv(shader.programInfo.camRotation, false, cameraRotationMatrix);
		gl.uniform3f(shader.programInfo.camPosition, x, y, z - zOffset);
	}

	setCurvature(curvature) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.curvature, curvature);
	}

	setLight(position, ambient, diffusionStrength, specularStrength, shininess) {
		const { gl, shader } = this;

		gl.uniform4f(shader.programInfo.lightIntensity, ambient, diffusionStrength, specularStrength, shininess);
		gl.uniform3fv(shader.programInfo.lightPosition, position);
	}

	setDepthEffect(fading, closeSaturation, farSaturation) {
		const { gl, shader } = this;
		gl.uniform4f(shader.programInfo.depthEffect, fading, 0, closeSaturation, farSaturation);
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
			} else if (!this.tooManySpriteError) {
				this.tooManySpriteError = true;
				console.error("Too many sprites.");
			}
		} else {
			chunk = this.chunks[sprite.chunkIndex];
		}
		return chunk;		
	}

	sendUpdatedBuffers(now) {
		const { shader, bufferInfo } = this;
		for (let b in bufferInfo) {
			this.bindBuffer(bufferInfo[b]);
			this.sendUpdatedBuffer(bufferInfo[b], now);
		}
	}

	bindBuffer(engineBuffer) {
		const { gl } = this;
		const { shaderBuffer } = engineBuffer;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);		
	}

	sendUpdatedBuffer(engineBuffer, now) {
		const { usedChunks } = this;
		const { chunkUpdateTimes } = engineBuffer;

		const HOLE_LIMIT = 4;
		let rangeStart = -1, holeSize = 0;
		for (let i = 0; i < usedChunks; i++) {
			if (rangeStart < 0) {
				if (chunkUpdateTimes[i] === now) {
					rangeStart = i;
				}
			} else if (chunkUpdateTimes[i] !== now) {
				holeSize++;
				if (holeSize >= HOLE_LIMIT) {
					this.sendBuffer(engineBuffer, rangeStart, i);
					rangeStart = -1;
					holeSize = 0;
				}
			}
		}
		if (rangeStart >= 0) {
			this.sendBuffer(engineBuffer, rangeStart, usedChunks);
		}
	}

	sendBuffer(engineBuffer, rangeStart, rangeEnd) {
		const { gl } = this;
		const { floatPerVertex, verticesPerSprite } = engineBuffer;

		//	set sprite data
		gl.bufferSubData(gl.ARRAY_BUFFER,
			rangeStart * verticesPerSprite * floatPerVertex * Float32Array.BYTES_PER_ELEMENT,
			engineBuffer.subarray(rangeStart, rangeEnd),
		);
	}

	sendSprites(sprites, now) {
		const { gl, pool, spriteRenderer } = this;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];			
			const chunk = this.getChunkFor(sprite)
			if (chunk) {
				pool.vec3forChunk.reset();
				spriteRenderer.render(sprite, chunk, now);
			}
		}
	}

	updatePlayingVideos(sprites, now) {
		const { mediaManager, textureManager, cycle } = this;
		const videos = mediaManager.updatePlayingVideos(sprites, now);
		if (videos.length) {
			//	only update video once per frame. Cycle through.
			textureManager.updateVideoTexture(videos[cycle % videos.length]);
		}
	}

	draw(now) {
		const { gl } = this;
		gl.drawElements(gl.TRIANGLES, this.usedChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
		this.lastRefresh = now;
		this.cycle ++;
	}
}