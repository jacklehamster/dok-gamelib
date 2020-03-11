/*
GLRenderer Engine


*/

class GLRenderer {
	constructor(canvas, webgl, imagedata) {
		const resolution = devicePixelRatio;
		canvas.width = canvas.offsetWidth * resolution;
		canvas.height = canvas.offsetHeight * resolution;
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
			move: 		new EngineBuffer(MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			gravity: 	new EngineBuffer(GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			spriteType: new EngineBuffer(SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			texCoord: 	new EngineBuffer(TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			animation: 	new EngineBuffer(ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			grid: 		new EngineBuffer(GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
			light: 		new EngineBuffer(LIGHT_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE),
		};

		this.shader = new Shader(gl, vertexShader, fragmentShader, this.bufferInfo);
		this.textureManager = new TextureManager(gl, this.shader);

		const { shader, textureManager, projectionMatrix, viewMatrix } = this;

		//	initialize view and projection
		this.setViewAngle(45);
		this.setViewPosition(0, 0, 0, 0, 0, 0);

		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
		this.chunks = new Array(MAX_SPRITE).fill(null).map((a, index) => {
			return new Chunk(index, this.bufferInfo);
		});
		this.usedChunks = 0;

		//	load texture
		imagedata.spritesheets.forEach((spritesheet, index) => textureManager.setImage(index, spritesheet));

		this.setBackground(0x000000);
		this.setCurvature(0);
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

	setViewAngle(viewAngle) {
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1, zFar = 1000.0;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
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
		mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, 
			ZERO_VEC3,
			Utils.set3(pool.vec3.get(), scale, scale, scale),
			Utils.set3(pool.vec3.get(), 0, -height, zOffset));
		quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites			
		mat4.translate(viewMatrix, viewMatrix, [x, y, z + zOffset]);

		mat4.fromQuat(cameraRotationMatrix, cameraQuat);
		gl.uniformMatrix4fv(shader.programInfo.view, false, viewMatrix);
		gl.uniformMatrix4fv(shader.programInfo.camRotation, false, cameraRotationMatrix);
	}

	setCurvature(curvature) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.curvature, curvature);
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
			} else {
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
		const HOLE_LIMIT = 2;
		let rangeStart = -1, holeSize = 0;
		for (let i = 0; i < usedChunks; i++) {
			if (rangeStart < 0) {
				if (chunkUpdateTimes[i] === now) {
					rangeStart = i;
				}
			} else if (chunkUpdateTimes[i] !== now) {
				holeSize++;
				if (holeSize > HOLE_LIMIT) {
					this.sendBuffer(shaderBuffer, engineBuffer, rangeStart, i - holeSize + 1);
					rangeStart = -1;
					holeSize = 0;
				}
			}
		}
		if (rangeStart >= 0) {
			this.sendBuffer(shaderBuffer, engineBuffer, rangeStart, usedChunks);
		}		
	}

	sendBuffer(shaderBuffer, engineBuffer, rangeStart, rangeEnd) {
		const { gl, shader } = this;
		const { floatPerVertex, verticesPerSprite } = engineBuffer;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER,
			rangeStart * verticesPerSprite * floatPerVertex * Float32Array.BYTES_PER_ELEMENT,
			engineBuffer.subarray(rangeStart, rangeEnd),
		);
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

		this.sendUpdatedBuffers(now);
	}

	draw() {
		const { gl } = this;
		gl.drawElements(gl.TRIANGLES, this.usedChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
	}
}