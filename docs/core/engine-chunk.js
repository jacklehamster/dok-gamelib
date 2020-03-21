/*
		opengl chunk
	*/

class Chunk {
	constructor(index, bufferInfo, pool) {
		this.subarrays = {};
		this.index = index;
		this.pool = pool;

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

	setOffset([x, y, z], now) {
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
		subarrays.vertex.fill(0);
		vertex.chunkUpdateTimes[index] = now;
	}

	applyNormal(vertices, normalSubarray, index, pool) {
		const vectorA = vec3.sub(pool.vec3.get(), vertices[index], vertices[(index + 1) % vertices.length]);
		const vectorB = vec3.sub(pool.vec3.get(), vertices[index], vertices[(index - 1 + vertices.length) % vertices.length]);
		normalSubarray.set(vec3.normalize(pool.vec3.get(), vec3.cross(pool.vec3.get(), vectorA, vectorB)), index * 3);
	}

	assignVertices(now, ... vertices) {
		const { vertex, normal, subarrays, pool, index } = this;
		for (let i = 0; i < vertices.length; i++) {
			subarrays.vertex.set(vertices[i], i * FLOAT_PER_VERTEX);
		}
		vertex.chunkUpdateTimes[index] = now;

		for (let i = 0; i < vertices.length; i++) {
			this.applyNormal(vertices, subarrays.normal, i, pool);
		}
		normal.chunkUpdateTimes[index] = now;
	}

	setWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
	}

	setBackWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setFloor(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, A, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, B, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, C, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, D, - halfHeight - hotspotY * height),
		);
		vertex.chunkUpdateTimes[index] = now;		
	}

	setCeiling(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, A, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), - halfWidth - hotspotX * width, B, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, C, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), + halfWidth - hotspotX * width, D, + halfHeight - hotspotY * height),
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setLeftWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), A, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), B, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), C, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), D, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
		);
		vertex.chunkUpdateTimes[index] = now;
	}

	setRightWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vertex, normal, subarrays, pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(pool.vec3.get(), A, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), B, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), C, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(pool.vec3.get(), D, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
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

	setTexture(texIndex, offset, spriteWidth, spriteHeight, scale, now) {
		const { texCoord, subarrays, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const [ spriteX, spriteY ] = offset;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		const scaleH = Math.sign(scale[0]);
		const scaleV = Math.sign(scale[1]);

		let left = texIndex + texX, right = texIndex + texX + texWidth;
		let up = texY, down = texY + texHeight;
		if (scaleH < 0) {
			const temp = left;
			left = right;
			right = temp;
		}
		if (scaleV < 0) {
			const temp = up;
			up = down;
			down = temp;
		}

		Chunk.assignValues(subarrays.texCoord,
			left,	up,		texWidth,	texHeight,
			left,	down,	texWidth,	texHeight,
			right,	down,	texWidth,	texHeight,
			right,	up,		texWidth,	texHeight,
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