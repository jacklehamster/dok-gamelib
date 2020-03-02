/*
	//	opengl chunk
	*/

class Chunk {
	constructor(index, vertex, offset, move, gravity, spriteType, texCoord, animation) {
		this.index = index;
		this.vertex = vertex;
		this.offset = offset;
		this.move = move;
		this.gravity = gravity;
		this.spriteType = spriteType;
		this.texCoord = texCoord;
		this.animation = animation;
		this.vertexSubarray = vertex.subarray(this.index, this.index+1);
		this.offsetSubarray = offset.subarray(this.index, this.index+1);
		this.moveSubarray = move.subarray(this.index, this.index+1);
		this.gravitySubarray = gravity.subarray(this.index, this.index+1);
		this.spriteTypeSubarray = spriteType.subarray(this.index, this.index+1);
		this.texCoordSubarray = texCoord.subarray(this.index, this.index+1);
		this.animationSubarray = animation.subarray(this.index, this.index+1);
	}

	static assignValues(float32Array, ... values) {
		for (let i = 0; i < values.length; i++) {
			float32Array[i] = values[i];
		}
	}

	setType(type, timeMillis) {
		const { spriteType, spriteTypeSubarray, index } = this;
		Chunk.assignValues(spriteTypeSubarray, type, type, type, type);
		spriteType.chunkUpdateTimes[index] = timeMillis;
	}

	setOffset(x, y, z, timeMillis) {
		const { offset, offsetSubarray, index } = this;
		Chunk.assignValues(offsetSubarray,
			x, y, z,
			x, y, z,
			x, y, z,
			x, y, z,
		);
		offset.chunkUpdateTimes[index] = timeMillis;
	}

	setWall(width, height, timeMillis) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth, + halfHeight, 0,
			- halfWidth, - halfHeight, 0,
			+ halfWidth, - halfHeight, 0,
			+ halfWidth, + halfHeight, 0,
		);
		vertex.chunkUpdateTimes[index] = timeMillis;
	}

	setFloor(width, height, timeMillis) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth, 0, - halfHeight,
			- halfWidth, 0, + halfHeight,
			+ halfWidth, 0, + halfHeight,
			+ halfWidth, 0, - halfHeight,
		);
		vertex.chunkUpdateTimes[index] = timeMillis;		
	}

	setCeiling(width, height, timeMillis) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth, 0, + halfHeight,
			- halfWidth, 0, - halfHeight,
			+ halfWidth, 0, - halfHeight,
			+ halfWidth, 0, + halfHeight,
		);
		vertex.chunkUpdateTimes[index] = timeMillis;		
	}

	setLeftWall(width, height, timeMillis) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			0, + halfWidth, + halfHeight,
			0, - halfWidth, + halfHeight,
			0, - halfWidth, - halfHeight,
			0, + halfWidth, - halfHeight,
		);
		vertex.chunkUpdateTimes[index] = timeMillis;		
	}

	setRightWall(width, height, timeMillis) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			0, + halfWidth, - halfHeight,
			0, - halfWidth, - halfHeight,
			0, - halfWidth, + halfHeight,
			0, + halfWidth, + halfHeight,
		);
		vertex.chunkUpdateTimes[index] = timeMillis;		
	}

	setMove(dx, dy, dz, timeMillis) {
		const { move, moveSubarray, index } = this;
		Chunk.assignValues(moveSubarray,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
			dx, dy, dz, timeMillis,
		);
		move.chunkUpdateTimes[index] = timeMillis;
	}

	setGravity(gx, gy, gz, timeMillis) {
		const { gravity, gravitySubarray, index } = this;
		Chunk.assignValues(gravitySubarray,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		gravity.chunkUpdateTimes[index] = timeMillis;
	}

	setTexture(texIndex, offset, spriteWidth, spriteHeight, timeMillis) {
		const { texCoord, texCoordSubarray, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		Chunk.assignValues(texCoordSubarray,
			texIndex + texX,			texY,				texWidth,	texHeight,
			texIndex + texX,			texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY,				texWidth,	texHeight,
		);
		texCoord.chunkUpdateTimes[index] = timeMillis;
	}

	setAnimation(cols, frame, range, frameRate, timeMillis) {
		const { animation, animationSubarray, index } = this;
		Chunk.assignValues(animationSubarray,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
			cols, frame, range, frameRate,
		);
		animation.chunkUpdateTimes[index] = timeMillis;
	}
}