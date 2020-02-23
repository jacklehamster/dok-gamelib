/*
Dok Engine

opengl engine:
Step 1: Request engine for chunk
Step 2: Update chunk
Step 3: If a chunk is not updated, it’s being recycled next turn.

*/

class Engine {
	constructor(canvas, webgl, imagedata) {
		const FLOAT_PER_VERTEX 				= 3;	//	x,y,z
		const MOVE_FLOAT_PER_VERTEX 		= 4;	//	x,y,z,time
		const GRAVITY_FLOAT_PER_VERTEX 		= 3;	//	x,y,z
		const TEXTURE_FLOAT_PER_VERTEX 		= 4;	//	x,y,w,h
		const ANIMATION_FLOAT_PER_VERTEX 	= 4;	//	cols,index,count,frameRate
		const VERTICES_PER_SPRITE 			= 4;	//	4 corners
		const INDEX_ARRAY_PER_SPRITE = new Uint16Array([
			0,  1,  2,
			0,  2,  3,
		]);

		const MAX_TEXTURES = 16;
		const MAX_SPRITE = 1000;

		this.TEXTURE_SIZE = 4096;
		
		canvas.width = canvas.offsetWidth * 2;
		canvas.height = canvas.offsetHeight * 2;
		canvas.style.width = `${canvas.width / 2}px`;
		canvas.style.height = `${canvas.height / 2}px`;

		const { vertexShader, fragmentShader } = webgl;
		this.gl = canvas.getContext("webgl", {antialias:false});
		this.shader = new Shader(this.gl, vertexShader, fragmentShader);
		this.textureManager = new TextureManager(this.gl, this.shader);
		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.imagedata = imagedata;

		const { gl, shader, textureManager, projectionMatrix, viewMatrix, TEXTURE_SIZE } = this;

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

		const chunkCount = 1000;
		this.chunkUpdateTimes = new Array(chunkCount).fill(0);
		this.chunks = new Array(chunkCount).fill(null).map((a, index) => {
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

	applyChunk(chunk) {
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
		const INDEX_ARRAY_PER_SPRITE_COUNT = 6;
		sprites.forEach(sprite => {
			if (sprite.chunkIndex >= 0 && sprite.updateTime < timeMillis) {
				return;
			}
			const chunk = this.getChunk(sprite)
			if (!chunk) {
				return;
			}

			const { src, animation, pos, mov, gravity, chunkIndex } = sprite;
			const { frame, range, frameRate, grid } = animation;
			const [ x, y, z ] = pos;
			const [ mx, my, mz ] = mov;
			const [ gx, gy, gz ] = gravity;
			const [ cols, rows ] = grid;
			const [ sheetWidth, sheetHeight ] = size;
			const { offset, size, index } = imagedata.sprites[src];
			chunk.setTexture(index, offset, sheetWidth / cols, sheetHeight / rows);
			chunk.setRect(x, y, z, 1, 1);
			chunk.setMove(mx, my, mz, timeMillis);
			chunk.setGravity(gx, gy, gz);
			chunk.setAnimation(cols, frame, range, frameRate);

			this.chunkUpdateTimes[chunkIndex] = timeMillis;
			//this.applyChunk(chunk);
		});

		this.applyChunks(timeMillis);

		gl.drawElements(gl.TRIANGLES, this.usedChunks * INDEX_ARRAY_PER_SPRITE_COUNT, gl.UNSIGNED_SHORT, 0);
	}
}
