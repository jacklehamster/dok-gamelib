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
	}
 */

class SpriteDefinitionProcessor {
	constructor(evaluator) {
		this.evaluator = evaluator;
		this.spriteProvider = new SpriteProvider();
		this.spriteCollector = [];
	}

	process(spriteDefinitions, nowSec) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		spriteDefinitions.forEach((definition, definitionIndex) => this.processSpriteDefinition(definition, definitionIndex, spriteCollector, nowSec));
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector, nowSec) {
		const { evaluator, spriteProvider } = this;
		const { src, type, animation, pos, mov, gravity, count } = definition;
		const totalCount = evaluator.evaluate(count) || 1;

		for (let instanceIndex = 0; instanceIndex < totalCount; instanceIndex ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, instanceIndex);

			const spriteSrc = evaluator.evaluate(src, sprite);
			const spriteType = evaluator.evaluate(type, sprite);
			if (spriteSrc !== sprite.src || spriteType !== sprite.type) {
				sprite.src = spriteSrc;
				sprite.type = spriteType;
				sprite.updated = nowSec;
			}

			if (pos && !vec3.equals(pos, sprite.pos)) {
				sprite.pos.set(pos);
				sprite.updated = nowSec;
			}
			if (mov && !vec3.equals(mov, sprite.mov)) {
				sprite.mov.set(mov);
				sprite.updated = nowSec;
			}
			if (gravity && !vec3.equals(gravity, sprite.gravity)) {
				sprite.gravity.set(gravity);
				sprite.updated = nowSec;
			}
			if (animation) {
				const { frame, range, frameRate, grid } = animation;
				const animFrame = 		evaluator.evaluate(frame, sprite) || 0;
				const animRange = 		evaluator.evaluate(range, sprite) || 1;
				const animFrameRate = 	evaluator.evaluate(frameRate, sprite) || 15;
				const animCols = 		evaluator.evaluate(grid[0], sprite) || 1;
				const animRows = 		evaluator.evaluate(grid[1], sprite) || 1;

				const spriteAnim = sprite.animation;
				if (spriteAnim.frame !== animFrame || spriteAnim.range !== animRange
					|| spriteAnim.frameRate !== animFrameRate
					|| spriteAnim.grid[0] !== animCols || spriteAnim.grid[1] !== animRows) {
					spriteAnim.frame = animFrame;
					spriteAnim.range = animRange;
					spriteAnim.frameRate = animFrameRate;
					spriteAnim.grid[0] = animCols;
					spriteAnim.grid[1] = animRows;
					sprite.updated = nowSec;
				}
			}
			spriteCollector.push(sprite);
		}
	}
}