/*
		opengl chunk
	*/

class Chunk {
	constructor(index, bufferInfo) {
		this.subarrays = {};
		this.index = index;

		for (let b in bufferInfo) {
			if (bufferInfo.hasOwnProperty(b)) {
				const buffer = bufferInfo[b];
				this[b] = buffer;
				this.subarrays[b] = buffer.subarray(this.index, this.index+1);
			}
		}
	}

	static assignValues(float32Array, ... values) {
		for (let i = 0; i < values.length; i++) {
			float32Array[i] = values[i];
		}
	}

	setType(type, now) {
		const { spriteType, subarrays, index } = this;
		Chunk.assignValues(subarrays.spriteType, type, type, type, type);
		spriteType.chunkUpdateTimes[index] = now;
	}

	setOffset(x, y, z, now) {
		const { offset, subarrays, index } = this;
		Chunk.assignValues(subarrays.offset,
			x, y, z,
			x, y, z,
			x, y, z,
			x, y, z,
		);
		offset.chunkUpdateTimes[index] = now;
	}

	setHidden(now) {
		const { vertex, subarrays, index } = this;
		Chunk.assignValues(subarrays.vertex,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			- halfWidth - hotspotX, + halfHeight - hotspotY, 0,
			- halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, + halfHeight - hotspotY, 0,
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setBackWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			+ halfWidth - hotspotX, + halfHeight - hotspotY, 0,
			+ halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			- halfWidth - hotspotX, - halfHeight - hotspotY, 0,
			- halfWidth - hotspotX, + halfHeight - hotspotY, 0,
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setFloor([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			- halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			- halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, - halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setCeiling([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			- halfWidth - hotspotX, 0, + halfHeight - hotspotY,
			- halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, - halfHeight - hotspotY,
			+ halfWidth - hotspotX, 0, + halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setLeftWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			0, + halfWidth - hotspotX, + halfHeight - hotspotY,
			0, - halfWidth - hotspotX, + halfHeight - hotspotY,
			0, - halfWidth - hotspotX, - halfHeight - hotspotY,
			0, + halfWidth - hotspotX, - halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setRightWall([width, height], [hotspotX, hotspotY], now) {
		const { vertex, subarrays, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		Chunk.assignValues(subarrays.vertex,
			0, + halfWidth - hotspotX, - halfHeight - hotspotY,
			0, - halfWidth - hotspotX, - halfHeight - hotspotY,
			0, - halfWidth - hotspotX, + halfHeight - hotspotY,
			0, + halfWidth - hotspotX, + halfHeight - hotspotY,
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setMove(dx, dy, dz, now) {
		const { move, subarrays, index } = this;
		Chunk.assignValues(subarrays.move,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
		);
		move.chunkUpdateTimes[index] = now;
	}

	setGravity(gx, gy, gz, now) {
		const { gravity, subarrays, index } = this;
		Chunk.assignValues(subarrays.gravity,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		gravity.chunkUpdateTimes[index] = now;
	}

	setTexture(texIndex, offset, spriteWidth, spriteHeight, now) {
		const { texCoord, subarrays, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		Chunk.assignValues(subarrays.texCoord,
			texIndex + texX,			texY,				texWidth,	texHeight,
			texIndex + texX,			texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY + texHeight,	texWidth,	texHeight,
			texIndex + texX + texWidth,	texY,				texWidth,	texHeight,
		);
		texCoord.chunkUpdateTimes[index] = now;
	}

	setGrid(cols, rows, now) {
		const { grid, subarrays, index } = this;
		Chunk.assignValues(subarrays.grid,
			cols, rows,
			cols, rows,
			cols, rows,
			cols, rows,
		);
		grid.chunkUpdateTimes[index] = now;
	}

	setLight(value, now) {
		const { light, subarrays, index } = this;
		Chunk.assignValues(subarrays.light, value, value, value, value);
		light.chunkUpdateTimes[index] = now;		
	}

	setAnimation(frame, start, range, frameRate, now) {
		const { animation, subarrays, index } = this;
		Chunk.assignValues(subarrays.animation,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
		);
		animation.chunkUpdateTimes[index] = now;
	}
}