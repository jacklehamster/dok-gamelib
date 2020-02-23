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
		const { src, type, animation, pos, mov, gravity, count } = definition;
		const { timeMillis } = evaluator;
		const totalCount = evaluator.evaluate(count) || 1;

		const instanceGroup = { sprite: null, index: 0 };
		for (let instanceIndex = 0; instanceIndex < totalCount; instanceIndex ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, instanceIndex);
			instanceGroup.sprite = sprite;
			instanceGroup.index = instanceIndex;

			const spriteSrc = evaluator.evaluate(src, instanceGroup);
			const spriteType = evaluator.evaluate(type, instanceGroup);
			if (spriteSrc !== sprite.src || spriteType !== sprite.type) {
				sprite.src = spriteSrc;
				sprite.type = spriteType;
				sprite.updateTime = timeMillis;
			}

			for (let i = 0; i < 3; i++) {
				if (pos) {
					const value = evaluator.evaluate(pos[i], instanceGroup);
					if (value !== sprite.pos[i]) {
						sprite.pos[i] = value;
						sprite.updateTime = timeMillis;
					}
				}
				if (mov) {
					const value = evaluator.evaluate(mov[i], instanceGroup);
					if (value !== sprite.mov[i]) {
						sprite.pos[i] = value;
						sprite.updateTime = timeMillis;
					}
				}
				if (gravity) {
					const value = evaluator.evaluate(gravity[i], instanceGroup);
					if (value !== sprite.gravity[i]) {
						sprite.gravity[i] = value;
						sprite.updateTime = timeMillis;
					}
				}
			}
			if (animation) {
				const { frame, range, frameRate, grid } = animation;
				const animFrame = 		evaluator.evaluate(frame, instanceGroup) || 0;
				const animRange = 		evaluator.evaluate(range, instanceGroup) || 1;
				const animFrameRate = 	evaluator.evaluate(frameRate, instanceGroup) || 15;
				const animCols = 		evaluator.evaluate(grid[0], instanceGroup) || 1;
				const animRows = 		evaluator.evaluate(grid[1], instanceGroup) || 1;

				const spriteAnim = sprite.animation;
				if (spriteAnim.frame !== animFrame || spriteAnim.range !== animRange
					|| spriteAnim.frameRate !== animFrameRate
					|| spriteAnim.grid[0] !== animCols || spriteAnim.grid[1] !== animRows) {
					spriteAnim.frame = animFrame;
					spriteAnim.range = animRange;
					spriteAnim.frameRate = animFrameRate;
					spriteAnim.grid[0] = animCols;
					spriteAnim.grid[1] = animRows;
					sprite.updateTime = timeMillis;
				}
			}
			spriteCollector.push(sprite);
		}
	}
}