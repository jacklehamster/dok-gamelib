/*
	//	opengl chunk
	{
		vertices: Float32Array([
			-.5,  .5, 0,		//	top-left
			-.5, -.5, 0,		//	bottom-left
			 .5, -.5, 0,		//	bottom-right
			 .5,  .5, 0,		//	top-left
		])

		//	[ x, y, spritewidth, spriteheight ]
		move: Float32Array([
			0, 0, 0, timeMillis,
			0, 0, 0, timeMillis,
			0, 0, 0, timeMillis,
			0, 0, 0, timeMillis,			
		])

		gravity: Float32Array([
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		])

		//	[ x, y, spritewidth, spriteheight ]
		textureCoord: Float32Array([
			0, 					0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			0, 					64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
		])

		//	[ cols, index, total, frameRate ]
		animation: Float32Array([
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
		])

				vertex.subarray(index, index+1),
				offset.subarray(index, index+1),
				move.subarray(index, index+1),
				gravity.subarray(index, index+1),
				texCoord.subarray(index, index+1),
				animation.subarray(index, index+1),

	*/

class Chunk {
	constructor(index, vertices, offset, move, gravity, texCoord, animation) {
		this.index = index;
		this.vertices = vertices;
		this.offset = offset;
		this.move = move;
		this.gravity = gravity;
		this.texCoord = texCoord;
		this.animation = animation;
	}

	static assignValues(float32Array, ... values) {
		for (let i = 0; i < values.length; i++) {
			float32Array[i] = values[i];
		}
	}

	setRect(x, y, z, width, height, timeMillis) {
		const { vertices, offset, index } = this;
		Chunk.assignValues(vertices.subarray(index, index+1),
			- width/2,	+ height/2,	0,
			- width/2,	- height/2,	0,
			+ width/2,	- height/2,	0,
			+ width/2,	+ height/2,	0,
		);
		vertices.chunkUpdateTimes[index] = timeMillis;
		Chunk.assignValues(offset.subarray(index, index+1),
			x, y, z,
			x, y, z,
			x, y, z,
			x, y, z,
		);
		offset.chunkUpdateTimes[index] = timeMillis;
	}

	setMove(dx, dy, dz, timeMillis) {
		const { move, index } = this;
		Chunk.assignValues(move.subarray(index, index+1),
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
		);
		move.chunkUpdateTimes[index] = timeMillis;
	}

	setGravity(gx, gy, gz, timeMillis) {
		const { gravity, index } = this;
		Chunk.assignValues(gravity.subarray(index, index+1),
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		gravity.chunkUpdateTimes[index] = timeMillis;
	}

	setTexture(texIndex, offset, spriteWidth, spriteHeight, timeMillis) {
		const { texCoord, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		Chunk.assignValues(texCoord.subarray(index, index+1),
			texIndex + texX,			texY,				texWidth,	texHeight,
			texIndex + texX,			texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY,				texWidth,	texHeight,
		);
		texCoord.chunkUpdateTimes[index] = timeMillis;
	}

	setAnimation(cols, frame, range, frameRate, timeMillis) {
		const { animation, index } = this;
		Chunk.assignValues(animation.subarray(index, index+1),
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
		);
		animation.chunkUpdateTimes[index] = timeMillis;
	}
}