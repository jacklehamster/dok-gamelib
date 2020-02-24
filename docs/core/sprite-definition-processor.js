/**
	Sprite structure:
	
	{
		src: ASSET_ID,			//	asset of the sprite
		type: SPRITE,			//	type of sprite (sprite vs walls)
		animation: {
			frame: FRAME,		//	starting animation frame
			range: RANGE,		//	number of frames to cycle through
			frameRate: FPS,		//	animation frame per second
			cols: COLS,			//	spritesheet columns
			rows: ROWS,			//	spritesheet rows
		},
		pos: [
			X,					//	sprite X position
			Y,					//	sprite Y position
			Z,					//	sprite Z position
		],
		mov: [
			X,					//	sprite X move
			Y,					//	sprite Y move
			Z,					//	sprite Z move
		],
		gravity: [
			X,					//	sprite X gravity
			Y,					//	sprite Y gravity
			Z,					//	sprite Z gravity
		],
		count: COUNT,			//	number of times to redraw the sprite
	}

	//	opengl chunk
	{
		vertices: Float32Array([
			-.5, .5, 0,		//	top-left
			-.5, -.5, 0,	//	bottom-left
			.5, -.5, 0,		//	bottom-right
			.5, .5, 0,		//	top-left
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
	}
 */

class SpriteDefinitionProcessor {
	constructor(evaluator) {
		this.evaluator = evaluator;
		this.spriteProvider = new SpriteProvider();
		this.spriteCollector = [];
	}

	process(spriteDefinitions) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		spriteDefinitions.forEach((definition, definitionIndex) => this.processSpriteDefinition(definition, definitionIndex, spriteCollector));
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector) {
		const { evaluator, spriteProvider } = this;
		const { src, type, animation, size, pos, mov, gravity, grid, count } = definition;
		const { timeMillis } = evaluator;
		const totalCount = evaluator.evaluate(count) || 1;

		for (let instanceIndex = 0; instanceIndex < totalCount; instanceIndex ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, instanceIndex);

			const spriteSrc = evaluator.evaluate(src, sprite, instanceIndex);
			const spriteType = evaluator.evaluate(type, sprite, instanceIndex) || 'sprite';
			if (spriteSrc !== sprite.src) {
				sprite.src = spriteSrc;
				sprite.updateTimes.src = timeMillis;
			}
			if (spriteType !== sprite.type) {
				sprite.type = spriteType;
				sprite.updateTimes.type = timeMillis;
			}
			const spriteWidth = size ? evaluator.evaluate(size[0], sprite, instanceIndex) : 1;
			const spriteHeight = size ? evaluator.evaluate(size[1], sprite, instanceIndex) : 1;
			if (sprite.size[0] !== spriteWidth || sprite.size[1] !== spriteHeight) {
				sprite.size[0] = spriteWidth;
				sprite.size[1] = spriteHeight;
				sprite.updateTimes.size = timeMillis;
			}

			for (let i = 0; i < 3; i++) {
				if (pos) {
					const value = evaluator.evaluate(pos[i], sprite, instanceIndex);
					if (value !== sprite.pos[i]) {
						sprite.pos[i] = value;
						sprite.updateTimes.pos = timeMillis;
					}
				}
				if (mov) {
					const value = evaluator.evaluate(mov[i], sprite, instanceIndex);
					if (value !== sprite.mov[i]) {
						sprite.mov[i] = value;
						sprite.updateTimes.mov = timeMillis;
					}
				}
				if (gravity) {
					const value = evaluator.evaluate(gravity[i], sprite, instanceIndex);
					if (value !== sprite.gravity[i]) {
						sprite.gravity[i] = value;
						sprite.updateTime.gravity = timeMillis;
					}
				}
			}
			if (animation) {
				const { frame, range, frameRate } = animation;
				const animFrame = evaluator.evaluate(frame, sprite, instanceIndex) || 0;
				const animRange = evaluator.evaluate(range, sprite, instanceIndex) || 1;
				const animFrameRate = evaluator.evaluate(frameRate, sprite, instanceIndex) || 15;

				const spriteAnim = sprite.animation;
				if (spriteAnim.frame !== animFrame || spriteAnim.range !== animRange
					|| spriteAnim.frameRate !== animFrameRate) {
					spriteAnim.frame = animFrame;
					spriteAnim.range = animRange;
					spriteAnim.frameRate = animFrameRate;
					sprite.updateTimes.animation = timeMillis;
				}
			}
			if (grid) {
				const animCols = evaluator.evaluate(grid[0], sprite, instanceIndex) || 1;
				const animRows = evaluator.evaluate(grid[1], sprite, instanceIndex) || 1;
				if (sprite.grid[0] !== animCols || sprite.grid[1] !== animRows) {
					sprite.grid[0] = animCols;
					sprite.grid[1] = animRows;
					sprite.updateTimes.grid = timeMillis;
				}
			}
			spriteCollector.push(sprite);
		}
	}
}