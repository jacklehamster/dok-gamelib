/*
Dok Engine

opengl engine:
Step 1: Request engine for chunk
Step 2: Update chunk
Step 3: If a chunk is not updated, it’s being recycled next turn.

*/

class Engine {
	constructor(canvas, webgl, imagedata) {
		const resolution = devicePixelRatio;
		canvas.width = canvas.offsetWidth * resolution;
		canvas.height = canvas.offsetHeight * resolution;
		canvas.style.width = `${canvas.width / resolution}px`;
		canvas.style.height = `${canvas.height / resolution}px`;

		const { vertexShader, fragmentShader } = webgl;
		this.webGLOptions = {
			antialias: false, preserveDrawingBuffer: false,
			alpha: false, depth: true, stencil: false,
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


		this.shader = new Shader(gl, vertexShader, fragmentShader);
		this.textureManager = new TextureManager(gl, this.shader);
		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.imagedata = imagedata;

		const { shader, textureManager, projectionMatrix, viewMatrix } = this;

		//	initialize view and projection
		this.setViewAngle(45);
		this.setViewPosition(0, 0, 0);

		this.floatBuffer = {
			vertex: new Float32Array(FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			move: new Float32Array(MOVE_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			gravity: new Float32Array(GRAVITY_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			texCoord: new Float32Array(TEXTURE_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			animation: new Float32Array(ANIMATION_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
		};

		this.chunkUpdateTimes = new Array(MAX_SPRITE).fill(0);
		this.chunks = new Array(MAX_SPRITE).fill(null).map((a, index) => {
			//	constructor(index, vertices, move, gravity, textureCoord, animation, spriteSheetIndex)
			const { vertex, move, gravity, texCoord, animation } = this.floatBuffer;
			return new Chunk(index,
				vertex.subarray(index * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX),
				move.subarray(index * VERTICES_PER_SPRITE * MOVE_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * MOVE_FLOAT_PER_VERTEX),
				gravity.subarray(index * VERTICES_PER_SPRITE * GRAVITY_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * GRAVITY_FLOAT_PER_VERTEX),
				texCoord.subarray(index * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX),
				animation.subarray(index * VERTICES_PER_SPRITE * ANIMATION_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * ANIMATION_FLOAT_PER_VERTEX),
			);
		});
		this.usedChunks = 0;

		//	load texture
		imagedata.spritesheets.forEach((spritesheet, index) => textureManager.setImage(index, spritesheet));
	}

	newChunk() {
		return this.usedChunks >= this.chunks.length ? null : this.chunks[this.usedChunks++];
	}

	setBackground(color) {
		const { gl } = this;
		color = color || 0;
		gl.clearColor(((color >> 16) % 256) / 256, ((color >> 8) % 256) / 256, (color % 256) / 256, 1.0);
	}

	setViewAngle(viewAngle) {
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1, zFar = 1000.0;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		gl.uniformMatrix4fv(shader.programInfo.projectionLocation, false, projectionMatrix);
	}

	setViewPosition(x, y, z) {
		const { gl, shader, viewMatrix } = this;
		mat4.translate(viewMatrix, mat4.identity(viewMatrix), vec3.fromValues(-x, -y, -z - 2));
		gl.uniformMatrix4fv(shader.programInfo.viewLocation, false, viewMatrix);
	}

	setTime(timeMillis) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.timeLocation, timeMillis);
	}

	clearScreen() {
		const { gl } = this;
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	applySingleChunk(chunk) {
		const { gl, shader } = this;
		const verticesByteOffset = chunk.index * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT;
		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.vertex);
		gl.bufferSubData(gl.ARRAY_BUFFER, verticesByteOffset * FLOAT_PER_VERTEX, chunk.vertices);

		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.move);
		gl.bufferSubData(gl.ARRAY_BUFFER, verticesByteOffset * MOVE_FLOAT_PER_VERTEX, chunk.move);

		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.gravity);
		gl.bufferSubData(gl.ARRAY_BUFFER, verticesByteOffset * GRAVITY_FLOAT_PER_VERTEX, chunk.gravity);

		//	[ x, y, spritewidth, spriteheight ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.texCoord);
		gl.bufferSubData(gl.ARRAY_BUFFER, verticesByteOffset * TEXTURE_FLOAT_PER_VERTEX, chunk.textureCoord);

		//	[ cols, index, total, frameRate ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.animation);
		gl.bufferSubData(gl.ARRAY_BUFFER, verticesByteOffset * ANIMATION_FLOAT_PER_VERTEX, chunk.animation);
	}

	getChunk(sprite) {
		let chunk;
		if (sprite.chunkIndex < 0) {
			chunk = this.newChunk();
			if (chunk)
				sprite.chunkIndex = chunk.index;
		} else {
			chunk = this.chunks[sprite.chunkIndex];
		}
		return chunk;		
	}

	applyChunks(timeMillis) {
		const { chunkUpdateTimes, usedChunks } = this;

		const HOLE_LIMIT = 2;
		let rangeStart = -1, holeSize = 0;
		for (let i = 0; i < usedChunks; i++) {
			if (rangeStart < 0) {
				if (chunkUpdateTimes[i] === timeMillis) {
					rangeStart = i;
				}
			} else if (chunkUpdateTimes[i] !== timeMillis) {
				holeSize++;
				if (holeSize > HOLE_LIMIT) {
					this.sendAllBuffers(rangeStart, i - holeSize + 1);
					rangeStart = -1;
					holeSize = 0;
				}
			}
		}
		if (rangeStart >= 0) {
			this.sendAllBuffers(rangeStart, usedChunks);
		}
	}

	sendAllBuffers(rangeStart, rangeEnd) {
		const { shader, floatBuffer } = this;
		this.sendBuffer(shader.buffer.vertex, floatBuffer.vertex, rangeStart, rangeEnd, FLOAT_PER_VERTEX);
		this.sendBuffer(shader.buffer.move, floatBuffer.move, rangeStart, rangeEnd, MOVE_FLOAT_PER_VERTEX);
		this.sendBuffer(shader.buffer.gravity, floatBuffer.gravity, rangeStart, rangeEnd, GRAVITY_FLOAT_PER_VERTEX);
		this.sendBuffer(shader.buffer.texCoord, floatBuffer.texCoord, rangeStart, rangeEnd, TEXTURE_FLOAT_PER_VERTEX);
		this.sendBuffer(shader.buffer.animation, floatBuffer.animation, rangeStart, rangeEnd, ANIMATION_FLOAT_PER_VERTEX);		
	}

	sendBuffer(bufferLocation, floatBuffer, rangeStart, rangeEnd, floatPerVertex) {
		const { gl, shader } = this;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferLocation);
		gl.bufferSubData(gl.ARRAY_BUFFER,
			rangeStart * VERTICES_PER_SPRITE * floatPerVertex * Float32Array.BYTES_PER_ELEMENT,
			floatBuffer.subarray(
				rangeStart * VERTICES_PER_SPRITE * floatPerVertex,
				rangeEnd * VERTICES_PER_SPRITE * floatPerVertex,
			),
		);
	}	

	display(sprites, timeMillis) {
		const { gl, imagedata } = this;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];			
			const chunk = this.getChunk(sprite)
			if (!chunk) {
				return;
			}

			const { src, animation, grid, size, pos, mov, gravity, chunkIndex, updateTimes } = sprite;
			if (updateTimes.grid === timeMillis || updateTimes.src === timeMillis) {
				const { offset, size, index } = imagedata.sprites[src];
				const [ sheetWidth, sheetHeight ] = size;
				const [ cols, rows ] = grid;
				chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows);
				this.chunkUpdateTimes[chunkIndex] = timeMillis;
			}
			if (updateTimes.pos === timeMillis || updateTimes.size !== timeMillis) {
				const [ x, y, z ] = pos;
				const [ width, height ] = size;
				chunk.setRect(x, y, z, width, height);
				this.chunkUpdateTimes[chunkIndex] = timeMillis;
			}
			if (updateTimes.mov === timeMillis) {
				const [ mx, my, mz ] = mov;
				chunk.setMove(mx, my, mz, timeMillis);
				this.chunkUpdateTimes[chunkIndex] = timeMillis;
			}
			if (updateTimes.gravity === timeMillis) {
				const [ gx, gy, gz ] = gravity;
				chunk.setGravity(gx, gy, gz);
				this.chunkUpdateTimes[chunkIndex] = timeMillis;
			}
			if (updateTimes.grid === timeMillis || updateTimes.animation === timeMillis) {
				const { frame, range, frameRate } = animation;
				const [ cols, rows ] = grid;
				chunk.setAnimation(cols, frame, range, frameRate);
				this.chunkUpdateTimes[chunkIndex] = timeMillis;
			}
		}

		this.applyChunks(timeMillis);
		gl.drawElements(gl.TRIANGLES, this.usedChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
	}
}
