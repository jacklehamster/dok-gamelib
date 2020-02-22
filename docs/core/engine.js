/*
Dok Engine

opengl engine:
Step 1: Request engine for chunk
Step 2: Update chunk
Step 3: If a chunk is not updated, it’s being recycled next turn.

*/

class Engine {
	constructor(canvas, webgl, spritesheets) {
		const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
		const MOVE_FLOAT_PER_VERTEX 	= 4;	//	x,y,z,time
		const GRAVITY_FLOAT_PER_VERTEX 	= 3;	//	x,y,z
		const TEXTURE_FLOAT_PER_VERTEX 	= 4;	//	x,y,w,h
		const ANIMATION_FLOAT_DATA 		= 4;	//	cols,index,count,frameRate
		const VERTICES_PER_SPRITE 		= 4;	//	4 corners
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
		this.cache = {};

		const { gl, shader, textureManager, projectionMatrix, viewMatrix, cache, TEXTURE_SIZE } = this;

		//	initialize view and projection
		this.setViewAngle(45);
		this.setPosition(0, 0, 0);

		this.floatBuffer = {
			vertex: new Float32Array(FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			move: new Float32Array(MOVE_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			gravity: new Float32Array(GRAVITY_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			texCoord: new Float32Array(TEXTURE_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE * MAX_SPRITE),
			animation: new Float32Array(ANIMATION_FLOAT_DATA * VERTICES_PER_SPRITE * MAX_SPRITE),
		};

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.vertex);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			-.5, .5, 0,		//	top-left
			-.5, -.5, 0,	//	bottom-left
			.5, -.5, 0,		//	bottom-right
			.5, .5, 0,		//	top-left
		]));

		const nowSec = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
		]));

		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.gravity);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		]));

		//	[ x, y, spritewidth, spriteheight ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.texCoord);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 					0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			0, 					64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
		]));

		//	[ cols, index, total, frameRate ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.animation);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
		]));


		//	load texture
		spritesheets.forEach((spritesheet, index) => textureManager.setImage(index, spritesheet));

		const chunkCount = 1000;
		this.chunks = new Array(chunkCount).fill(null).map((a, index) => {
			//	constructor(index, vertices, move, gravity, textureCoord, animation, spriteSheetIndex)
			const { vertex, move, gravity, texCoord, animation } = this.floatBuffer;
			return new Chunk(index,
				vertex.subarray(index * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX),
				move.subarray(index * VERTICES_PER_SPRITE * MOVE_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * MOVE_FLOAT_PER_VERTEX),
				gravity.subarray(index * VERTICES_PER_SPRITE * GRAVITY_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * GRAVITY_FLOAT_PER_VERTEX),
				texCoord.subarray(index * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX, (index+1) * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX),
				animation.subarray(index * VERTICES_PER_SPRITE * ANIMATION_FLOAT_DATA, (index+1) * VERTICES_PER_SPRITE * ANIMATION_FLOAT_DATA),
			);
		});
		this.usedChunks = 0;
	}

	setBackground(color) {
		color = color || 0;
		this.gl.clearColor(((color >> 16) % 256) / 256, ((color >> 8) % 256) / 256, (color % 256) / 256, 1.0);
	}

	setViewAngle(viewAngle) {
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1, zFar = 1000.0;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		gl.uniformMatrix4fv(shader.programInfo.projectionLocation, false, projectionMatrix);
	}

	setPosition(x, y, z) {
		const { gl, shader, viewMatrix } = this;
		mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(-x, -y, -z - 2));
		gl.uniformMatrix4fv(shader.programInfo.viewLocation, false, viewMatrix);
	}

	setTime(timeMillis) {
		const { gl, shader } = this;
		const nowSec = timeMillis / 1000;
		gl.uniform1f(shader.programInfo.nowLocation, nowSec);
		return nowSec;
	}

	clearScreen() {
		const { gl } = this;
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	display(sprites) {
		const { gl } = this;
		const INDEX_ARRAY_PER_SPRITE_COUNT = 6;
		gl.drawElements(gl.TRIANGLES, 1 * INDEX_ARRAY_PER_SPRITE_COUNT, gl.UNSIGNED_SHORT, 0);
	}
}
