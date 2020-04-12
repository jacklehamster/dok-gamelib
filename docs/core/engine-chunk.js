/*
		opengl chunk
	*/

class Chunk {
	constructor(index, bufferInfo, vec3pool) {
		this.index = index;
		this.vec3pool = vec3pool;
		this.bufferInfo = bufferInfo;
	}

	assignValues(buffer, ... values) {
		buffer.assignValues(this.index, ... values);
	}

	setType(type, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.spriteType, type, type, type, type);
		bufferInfo.spriteType.chunkUpdateTimes[index] = now;
	}

	setOffset([x, y, z], now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.offset,
			x, y, z,
			x, y, z,
			x, y, z,
			x, y, z,
		);
		bufferInfo.offset.chunkUpdateTimes[index] = now;
	}

	setHidden(now) {
		const { bufferInfo, index } = this;
 		const { buffer, floatPerVertex, verticesPerSprite } = bufferInfo.vertex;
		buffer.fill(0, this.index * verticesPerSprite * floatPerVertex, (this.index+1) * verticesPerSprite * floatPerVertex);
		bufferInfo.vertex.chunkUpdateTimes[index] = now;
	}

	applyNormal(vertices, engineBuffer, i) {
		const { vec3pool } = this;
 		const { buffer, floatPerVertex, verticesPerSprite } = engineBuffer;
		const vectorA = vec3.sub(vec3pool.get(), vertices[i], vertices[(i + 1) % vertices.length]);
		const vectorB = vec3.sub(vec3pool.get(), vertices[i], vertices[(i - 1 + vertices.length) % vertices.length]);
		const cross = vec3.normalize(vec3pool.get(), vec3.cross(vec3pool.get(), vectorA, vectorB));
		buffer.set(cross, this.index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
	}

	assignVertices(now, ... vertices) {
		const { bufferInfo, index } = this;
 		const { buffer, floatPerVertex, verticesPerSprite } = bufferInfo.vertex;
		for (let i = 0; i < vertices.length; i++) {
			buffer.set(vertices[i], index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		}
		bufferInfo.vertex.chunkUpdateTimes[index] = now;

		for (let i = 0; i < vertices.length; i++) {
			this.applyNormal(vertices, bufferInfo.normal, i);
		}
		bufferInfo.normal.chunkUpdateTimes[index] = now;
	}

	setWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
	}

	setBackWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
	}

	setFloor(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, - halfHeight - hotspotY * height),
		);
	}

	setCeiling(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, + halfHeight - hotspotY * height),
		);
	}

	setLeftWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
		);
	}

	setRightWall(width, height, [hotspotX, hotspotY], [A,B,C,D], now) {
		const { vec3pool, index } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(now,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
		);
	}

	setMove(dx, dy, dz, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.move,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
			dx, dy, dz, now,
		);
		bufferInfo.move.chunkUpdateTimes[index] = now;
	}

	setGravity(gx, gy, gz, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.gravity,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		bufferInfo.gravity.chunkUpdateTimes[index] = now;
	}

	setTexture(texIndex, spriteX, spriteY, spriteWidth, spriteHeight, scale, brightness, padding, crop, circleRadius, now) {
		const { bufferInfo, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		const [ scaleH, scaleV ] = scale;
		const horizontalShift = texIndex * 2;
		const verticalShift = Math.round(brightness) * 2;
		const cropX = crop[0] / TEXTURE_SIZE;
		const cropY = crop[1] / TEXTURE_SIZE;
		const cropWidth = crop[2] / TEXTURE_SIZE;
		const cropHeight = crop[3] / TEXTURE_SIZE;

		let left = horizontalShift + texX + (padding * texWidth / 100) + cropX,
			right = horizontalShift + texX + cropX + (cropWidth || texWidth) - (padding * texWidth / 100);
		let up = verticalShift + texY + (padding * texHeight / 100) + cropY,
			down = verticalShift + texY + cropY + (cropHeight || texHeight) - (padding * texHeight / 100);

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

		this.assignValues(bufferInfo.texCenter,
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
			(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
		);

		bufferInfo.texCenter.chunkUpdateTimes[index] = now;

		this.assignValues(bufferInfo.texCoord,
			left,	up,		texWidth,	texHeight,
			left,	down,	texWidth,	texHeight,
			right,	down,	texWidth,	texHeight,
			right,	up,		texWidth,	texHeight,
		);

		bufferInfo.texCoord.chunkUpdateTimes[index] = now;
	}

	setTint(value, now) {
		const { bufferInfo, index } = this;
		const color = value & 0xFFFFFF;
		const mixRatio = Math.max(0, (value / 0xFFFFFF) / 255);
		this.assignValues(bufferInfo.tintColor,
			color, mixRatio,
			color, mixRatio,
			color, mixRatio,
			color, mixRatio);
		bufferInfo.tintColor.chunkUpdateTimes[index] = now;				
	}

	setGrid(cols, rows, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.grid,
			cols, rows,
			cols, rows,
			cols, rows,
			cols, rows,
		);
		bufferInfo.grid.chunkUpdateTimes[index] = now;
	}

	setAnimation(frame, start, range, frameRate, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.animation,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
			frame, start, range, frameRate,
		);
		bufferInfo.animation.chunkUpdateTimes[index] = now;
	}
}