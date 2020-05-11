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

	static assignValues(engineBuffer, index, ... values) {
		engineBuffer.assignValues(index, ... values);
	}

	// static setType(type, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index, type, type, type, type);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setOffset([x, y, z], now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		x, y, z,
	// 		x, y, z,
	// 		x, y, z,
	// 		x, y, z,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	setHidden(now, engineBuffer, index) {
 		const { buffer, floatPerVertex, verticesPerSprite } = engineBuffer;
		buffer.fill(0, index * verticesPerSprite * floatPerVertex, (index+1) * verticesPerSprite * floatPerVertex);
		engineBuffer.chunkUpdateTimes[index] = now;
		this.hidden = true;
	}

	static applyNormal(vertices, engineBuffer, curvature, i, index, vec3pool) {
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
			buffer.set(newCross, index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		} else {
			buffer.set(cross, index * verticesPerSprite * floatPerVertex + i * floatPerVertex);
		}
	}

	// static setTintAndHue(tint, hue, now, engineBuffer, index) {
	// 	const color = tint & 0xFFFFFF;
	// 	const mixRatio = Math.max(0, (tint / 0xFFFFFF) / 255);
	// 	Chunk.assignValues(engineBuffer, index,
	// 		color, mixRatio, hue, 0,
	// 		color, mixRatio, hue, 0,
	// 		color, mixRatio, hue, 0,
	// 		color, mixRatio, hue, 0,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;				
	// }

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
			Chunk.applyNormal(vertices, bufferInfo.normal, curvature, i, index, vec3pool);
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

	// static setMove(dx, dy, dz, time, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		dx, dy, dz, time,
	// 		dx, dy, dz, time,
	// 		dx, dy, dz, time,
	// 		dx, dy, dz, time,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setGravity(gx, gy, gz, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setTexture(texIndex, spriteX, spriteY, spriteWidth, spriteHeight, scale, brightness, padding, now, engineBuffer, index) {
	// 	const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
	// 	const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;
	// 	const [ scaleH, scaleV ] = scale;
	// 	const horizontalShift = texIndex * 2;
	// 	const verticalShift = Math.round(brightness) * 2;

	// 	let left = horizontalShift + texX + (padding * texWidth / 100),
	// 		right = horizontalShift + texX + texWidth - (padding * texWidth / 100);
	// 	let up = verticalShift + texY + (padding * texHeight / 100),
	// 		down = verticalShift + texY + texHeight - (padding * texHeight / 100);

	// 	if (scaleH < 0) {
	// 		const temp = left;
	// 		left = right;
	// 		right = temp;
	// 	}
	// 	if (scaleV < 0) {
	// 		const temp = up;
	// 		up = down;
	// 		down = temp;
	// 	}

	// 	Chunk.assignValues(engineBuffer, index,
	// 		left,	up,		texWidth,	texHeight,
	// 		left,	down,	texWidth,	texHeight,
	// 		right,	down,	texWidth,	texHeight,
	// 		right,	up,		texWidth,	texHeight,
	// 	);

	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setTextureCenter(spriteX, spriteY, spriteWidth, spriteHeight, padding, circleRadius, now, engineBuffer, index) {
	// 	const texWidth = spriteWidth / TEXTURE_SIZE, texHeight = spriteHeight / TEXTURE_SIZE;
	// 	const texX = spriteX / TEXTURE_SIZE, texY = spriteY / TEXTURE_SIZE;

	// 	let left = texX + (padding * texWidth / 100),
	// 		right = texX + texWidth - (padding * texWidth / 100);
	// 	let up = texY + (padding * texHeight / 100),
	// 		down = texY + texHeight - (padding * texHeight / 100);

	// 	Chunk.assignValues(engineBuffer, index,
	// 		(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
	// 		(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
	// 		(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
	// 		(left % 2 + right % 2) / 2, (up % 2 + down % 2) / 2, circleRadius * Math.abs(left - right), circleRadius * Math.abs(up - down),
	// 	);

	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setGrid(cols, rows, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		cols, rows,
	// 		cols, rows,
	// 		cols, rows,
	// 		cols, rows,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setAnimation(start, range, frameRate, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		now, start, range, frameRate,
	// 		now, start, range, frameRate,
	// 		now, start, range, frameRate,
	// 		now, start, range, frameRate,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setBlackholeCenter([ gx, gy, gz ], now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 		gx, gy, gz,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setBlackholeInfo(strength, distance, now, engineBuffer, index) {
	// 	Chunk.assignValues(engineBuffer, index,
	// 		strength, distance,
	// 		strength, distance,
	// 		strength, distance,
	// 		strength, distance,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }

	// static setChromaKey([low, high], color, now, engineBuffer, index) {
	// 	const a = ((color >> 24) % 256) / 255;
	// 	const rgb = color & 0xFFFFFF;

	// 	Chunk.assignValues(engineBuffer, index,
	// 		low, high, rgb, a,
	// 		low, high, rgb, a,
	// 		low, high, rgb, a,
	// 		low, high, rgb, a,
	// 	);
	// 	engineBuffer.chunkUpdateTimes[index] = now;
	// }
}