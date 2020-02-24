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
	*/

class Chunk {
	constructor(index, vertices, move, gravity, textureCoord, animation) {
		this.index = index;
		this.vertices = vertices;
		this.move = move;
		this.gravity = gravity;
		this.textureCoord = textureCoord;
		this.animation = animation;
	}

	static assignValues(float32Array, ... values) {
		for (let i = 0; i < values.length; i++) {
			float32Array[i] = values[i];
		}
//		float32Array.set(values);
	}

	setRect(x, y, zOrder, width, height) {
		Chunk.assignValues(this.vertices,
			x - width/2,	y + height/2,	zOrder,
			x - width/2,	y - height/2,	zOrder,
			x + width/2,	y - height/2,	zOrder,
			x + width/2,	y + height/2,	zOrder,
		);
	}

	setMove(dx, dy, dz, timeMillis) {
		Chunk.assignValues(this.move,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
		);
	}

	setGravity(gx, gy, gz) {
		Chunk.assignValues(this.gravity,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
	}

	setTexture(index, offset, spriteWidth, spriteHeight) {
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		Chunk.assignValues(this.textureCoord,
			index + texX,				texY,				texWidth,	texHeight,
			index + texX,				texY + texHeight,	texWidth,	texHeight,
			index + texX + texWidth,	texY + texHeight,	texWidth,	texHeight,
			index + texX + texWidth,	texY,				texWidth,	texHeight,
		);
	}

	setAnimation(cols, frame, range, frameRate) {
		Chunk.assignValues(this.animation,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
		);
	}
}