/*
		opengl chunk
	*/

class Chunk {
	constructor(index, {vertex, offset, move, gravity, spriteType, texCoord, animation, grid, light}) {
		this.index = index;
		this.vertex = vertex;
		this.offset = offset;
		this.move = move;
		this.gravity = gravity;
		this.spriteType = spriteType;
		this.texCoord = texCoord;
		this.animation = animation;
		this.grid = grid;
		this.light = light;
		this.vertexSubarray = vertex.subarray(this.index, this.index+1);
		this.offsetSubarray = offset.subarray(this.index, this.index+1);
		this.moveSubarray = move.subarray(this.index, this.index+1);
		this.gravitySubarray = gravity.subarray(this.index, this.index+1);
		this.spriteTypeSubarray = spriteType.subarray(this.index, this.index+1);
		this.texCoordSubarray = texCoord.subarray(this.index, this.index+1);
		this.animationSubarray = animation.subarray(this.index, this.index+1);
		this.gridSubarray = grid.subarray(this.index, this.index+1);
		this.lightSubarray = light.subarray(this.index, this.index+1);
	}

	static assignValues(float32Array, ... values) {
		for (let i = 0; i < values.length; i++) {
			float32Array[i] = values[i];
		}
	}

	setType(type, now) {
		const { spriteType, spriteTypeSubarray, index } = this;
		Chunk.assignValues(spriteTypeSubarray, type, type, type, type);
		spriteType.chunkUpdateTimes[index] = now;
	}

	setOffset(x, y, z, now) {
		const { offset, offsetSubarray, index } = this;
		Chunk.assignValues(offsetSubarray,
			x, y, z,
			x, y, z,
			x, y, z,
			x, y, z,
		);
		offset.chunkUpdateTimes[index] = now;
	}

	setHidden(now) {
		const { vertex, vertexSubarray, index } = this;
		Chunk.assignValues(vertexSubarray,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth - hotspotX, + halfHeight - hotspotY, 0,
			- halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, + halfHeight - hotspotY, 0,
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setBackWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			- halfWidth - hotspotX, + halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, + halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, - halfHeight - hotspotY, 0,
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setFloor([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			- halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, - halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setCeiling([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			- halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			- halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, + halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setLeftWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			0, + halfWidth - hotspotX, + halfHeight - hotspotY,
			0, - halfWidth - hotspotX, + halfHeight - hotspotY,
			0, - halfWidth - hotspotX, - halfHeight - hotspotY,
			0, + halfWidth - hotspotX, - halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setRightWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, vertexSubarray, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(vertexSubarray,
			0, + halfWidth - hotspotX, - halfHeight - hotspotY,
			0, - halfWidth - hotspotX, - halfHeight - hotspotY,
			0, - halfWidth - hotspotX, + halfHeight - hotspotY,
			0, + halfWidth - hotspotX, + halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setMove(dx, dy, dz, now) {
		const { move, moveSubarray, index } = this;
		Chunk.assignValues(moveSubarray,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
		);
		move.chunkUpdateTimes[index] = now;
	}

	setGravity(gx, gy, gz, now) {
		const { gravity, gravitySubarray, index } = this;
		Chunk.assignValues(gravitySubarray,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		gravity.chunkUpdateTimes[index] = now;
	}

	setTexture(texIndex, offset, spriteWidth, spriteHeight, now) {
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
		texCoord.chunkUpdateTimes[index] = now;
	}

	setGrid(cols, rows, now) {
		const { grid, gridSubarray, index } = this;
		Chunk.assignValues(gridSubarray,
			cols, rows,
			cols, rows,
			cols, rows,
			cols, rows,
		);
		grid.chunkUpdateTimes[index] = now;
	}

	setLight(value, now) {
		const { light, lightSubarray, index } = this;
		Chunk.assignValues(lightSubarray, value, value, value, value);
		light.chunkUpdateTimes[index] = now;		
	}

	setAnimation(frame, start, range, frameRate, now) {
		const { animation, animationSubarray, index } = this;
		Chunk.assignValues(animationSubarray,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
		);
		animation.chunkUpdateTimes[index] = now;
	}
}