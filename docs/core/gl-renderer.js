/*
GLRenderer Engine


*/

class GLRenderer {
	constructor(canvas, webgl, {imagedata, game}) {
		const resolution = devicePixelRatio;
		canvas.width = game.width * resolution;
		canvas.height = game.height * resolution;
		canvas.style.width = `${canvas.width / resolution}px`;
		canvas.style.height = `${canvas.height / resolution}px`;

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
		};

		this.bufferInfo = {
			vertex: 	new EngineBuffer(FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			offset: 	new EngineBuffer(FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			normal: 	new EngineBuffer(NORMAL_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			move: 		new EngineBuffer(MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			gravity: 	new EngineBuffer(GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			spriteType: new EngineBuffer(SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			texCoord: 	new EngineBuffer(TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			animation: 	new EngineBuffer(ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			grid: 		new EngineBuffer(GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
		};

		this.shader = new Shader(gl, vertexShader, fragmentShader, this.bufferInfo);
		this.textureManager = new TextureManager(gl, this.shader);

		const { shader, textureManager } = this;

		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
		this.chunks = new Array(MAX_SPRITE).fill(null).map((a, index) => new Chunk(index, this.bufferInfo, this.pool));
		this.usedChunks = 0;

		//	load texture
		imagedata.spritesheets.forEach((src, index) => {
			Utils.load(src).then(image => textureManager.setImage(index, image));
		});

		this.lastRefresh = 0;
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
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, near, far);
		gl.uniformMatrix4fv(shader.programInfo.projection, false, projectionMatrix);
	}

	setViewPosition(x, y, z, height, turn, cameraDistance) {
		const { gl, shader, viewMatrix, pool } = this;
		const scale = 1;
		const tilt = height/2;
		const zOffset = cameraDistance;	//	camera distance
		const cameraQuat = pool.quat.get();
		const cameraRotationMatrix = pool.mat4.get();
		quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
		mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3,
			Utils.set3(pool.vec3.get(), scale, scale, scale),
			Utils.set3(pool.vec3.get(), 0, -height, zOffset));
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
		const { vertex, offset, move, gravity, spriteType, texCoord, animation, grid } = this.bufferInfo;
		for (let b in bufferInfo) {
			this.sendUpdatedBuffer(bufferInfo[b], now);
		}
	}

	sendUpdatedBuffer(engineBuffer, now) {
		const { usedChunks } = this;
		const { chunkUpdateTimes, shaderBuffer } = engineBuffer;

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
		const { gl, shader } = this;
		const { floatPerVertex, verticesPerSprite, shaderBuffer } = engineBuffer;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER,
			rangeStart * verticesPerSprite * floatPerVertex * Float32Array.BYTES_PER_ELEMENT,
			engineBuffer.subarray(rangeStart, rangeEnd),
		);
	}

	getNameFromEngineBuffer(engineBuffer) {
		for (let i in this.bufferInfo) {
			if (engineBuffer === this.bufferInfo[i]) {
				return i;
			}
		}
		return null;
	}

	sendSprites(sprites, now) {
		const { gl } = this;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];			
			const chunk = this.getChunkFor(sprite)
			if (chunk) {
				sprite.updateChunk(this, chunk, now);
			}
		}
	}

	draw(now) {
		const { gl } = this;
		gl.drawElements(gl.TRIANGLES, this.usedChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
		this.lastRefresh = now;
	}
}
