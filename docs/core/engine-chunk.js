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

const TEXTURE_SIZE = 4096;

class Chunk {
	constructor(index, vertices, move, gravity, textureCoord, animation) {
		this.index = index;
		this.vertices = vertices;
		this.move = move;
		this.gravity = gravity;
		this.textureCoord = textureCoord;
		this.animation = animation;
	}

	setRect(x, y, width, height) {
		this.vertices.set([
			x - width/2,	y + height/2,	0,
			x - width/2,	y - height/2,	0,
			x + width/2,	y - height/2,	0,
			x + width/2,	y + height/2,	0,
		]);
	}

	setMove(dx, dy, nowSec) {
		this.move.set([
			dx, dy, 0, nowSec,
			dx, dy, 0, nowSec,
			dx, dy, 0, nowSec,
			dx, dy, 0, nowSec,
		]);
	}

	setTexture(index, offset, spriteWidth, spriteHeight) {
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		this.textureCoord.set([
			index + texX,				texY,				texWidth,	texHeight,
			index + texX,				texY + texHeight,	texWidth,	texHeight,
			index + texX + texWidth,	texY + texHeight,	texWidth,	texHeight,
			index + texX + texWidth,	texY,				texWidth,	texHeight,
		]);
	}

	setAnimation(cols, frame, range, frameRate) {
		this.animation.set([
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
		]);
	}
}