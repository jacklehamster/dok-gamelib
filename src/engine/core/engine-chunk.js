/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
		opengl chunk
	*/

class Chunk {
	constructor(index, bufferInfo, vec3pool) {
		this.index = index;
		this.vec3pool = vec3pool;
		this.bufferInfo = bufferInfo;
		this.hidden = false;
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
		this.hidden = true;
	}

	applyNormal(vertices, engineBuffer, curvature, i) {
		const { vec3pool } = this;
 		const { buffer, floatPerVertex, verticesPerSprite } = engineBuffer;
		const vectorA = vec3.sub(vec3pool.get(), vertices[i], Utils.getFromArray(vertices, i + 1));
		const vectorB = vec3.sub(vec3pool.get(), vertices[i], Utils.getFromArray(vertices, i - 1));
		const cross = vec3.cross(vec3pool.get(), vectorA, vectorB);
		vec3.normalize(cross, cross);

		if (curvature !== 0) {
			const crossValue = vec3.scale(vec3pool.get(), cross, curvature);	
			const vectorA = vec3.sub(vec3pool.get(), vec3.add(vec3pool.get(), vertices[i], crossValue), Utils.getFromArray(vertices, i + 1));
			const vectorB = vec3.sub(vec3pool.get(), vec3.add(vec3pool.get(), vertices[i], crossValue), Utils.getFromArray(vertices, i - 1));
			const newCross = vec3.cross(vec3pool.get(), vectorA, vectorB);
			vec3.normalize(newCross, newCross);
			buffer.set(newCross, this.index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		} else {
			buffer.set(cross, this.index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		}
	}

	assignVertices(now, { angle, center }, { curvature }, ... vertices) {
		const { bufferInfo, index, vec3pool } = this;
 		const { buffer, floatPerVertex, verticesPerSprite } = bufferInfo.vertex;

 		const [ angleX, angleY, angleZ ] = angle;
 		const deg2rad = 180 / Math.PI;
 		const quaternion = quat.fromEuler(quat.create(), angleX * deg2rad, angleY * deg2rad, angleZ * deg2rad);
 		for (let i = 0; i < vertices.length; i++) {
 			const newVec3 = vec3pool.get();
 			vec3.sub(newVec3, vertices[i], center);
			vec3.transformQuat(newVec3, newVec3, quaternion);
 			vec3.add(newVec3, newVec3, center);
 			vertices[i] = newVec3;
 		}
		for (let i = 0; i < vertices.length; i++) {
			buffer.set(vertices[i], index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		}
		bufferInfo.vertex.chunkUpdateTimes[index] = now;

		for (let i = 0; i < vertices.length; i++) {
			this.applyNormal(vertices, bufferInfo.normal, curvature, i);
		}
		bufferInfo.normal.chunkUpdateTimes[index] = now;
	}

	setWall(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
		this.hidden = false;
	}

	setBackWall(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, + halfHeight - hotspotY * height, A),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, - halfHeight - hotspotY * height, B),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, - halfHeight - hotspotY * height, C),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, + halfHeight - hotspotY * height, D),
		);
		this.hidden = false;
	}

	setFloor(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, - halfHeight - hotspotY * height),
		);
		this.hidden = false;
	}

	setCeiling(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = width/2, halfHeight = height/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, A, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), - halfWidth - hotspotX * width, B, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, C, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), + halfWidth - hotspotX * width, D, + halfHeight - hotspotY * height),
		);
		this.hidden = false;
	}

	setLeftWall(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
		);
		this.hidden = false;
	}

	setRightWall(width, height, [hotspotX, hotspotY], [A,B,C,D], rotation, effects, now) {
		const { vec3pool, index } = this;
		const halfWidth = height/2, halfHeight = width/2;
		this.assignVertices(now, rotation, effects,
			Utils.set3(vec3pool.get(), A, + halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), B, - halfWidth - hotspotX * width, - halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), C, - halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
			Utils.set3(vec3pool.get(), D, + halfWidth - hotspotX * width, + halfHeight - hotspotY * height),
		);
		this.hidden = false;
	}

	setMove(dx, dy, dz, time, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.move,
			dx, dy, dz, time,
			dx, dy, dz, time,
			dx, dy, dz, time,
			dx, dy, dz, time,
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

	setTexture(texIndex, spriteX, spriteY, spriteWidth, spriteHeight, scale, brightness, padding, circleRadius, now) {
		const { bufferInfo, index } = this;
		const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
		const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
		const [ scaleH, scaleV ] = scale;
		const horizontalShift = texIndex * 2;
		const verticalShift = Math.round(brightness) * 2;

		let left = horizontalShift + texX + (padding * texWidth / 100),
			right = horizontalShift + texX + texWidth - (padding * texWidth / 100);
		let up = verticalShift + texY + (padding * texHeight / 100),
			down = verticalShift + texY + texHeight - (padding * texHeight / 100);

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

	setTintAndHue(value, hue, now) {
		const { bufferInfo, index } = this;
		const color = value & 0xFFFFFF;
		const mixRatio = Math.max(0, (value / 0xFFFFFF) / 255);
		this.assignValues(bufferInfo.colorEffect,
			color, mixRatio, hue, 0,
			color, mixRatio, hue, 0,
			color, mixRatio, hue, 0,
			color, mixRatio, hue, 0,
		);
		bufferInfo.colorEffect.chunkUpdateTimes[index] = now;				
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

	setAnimation(start, range, frameRate, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.animation,
			now, start, range, frameRate,
			now, start, range, frameRate,
			now, start, range, frameRate,
			now, start, range, frameRate,
		);
		bufferInfo.animation.chunkUpdateTimes[index] = now;
	}

	setBlackholeCenter([ gx, gy, gz ], now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.blackholeCenter,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
			gx, gy, gz,
		);
		bufferInfo.blackholeCenter.chunkUpdateTimes[index] = now;
	}

	setBlackholeInfo(strength, distance, now) {
		const { bufferInfo, index } = this;
		this.assignValues(bufferInfo.blackholeInfo,
			strength, distance,
			strength, distance,
			strength, distance,
			strength, distance,
		);
		bufferInfo.blackholeInfo.chunkUpdateTimes[index] = now;
	}
}