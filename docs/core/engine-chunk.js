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
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,			
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
	init(index, vertices, move, gravity, textureCoord, animation) {
		this.index = index;
		this.vertices = vertices;
		this.move = move;
		this.gravity = gravity;
		this.textureCoord = textureCoord;
		this.animation = animation;
		return this;
	}
}