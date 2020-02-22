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

class SpriteProcessor {
	constructor(game, engine) {
		this.game = game;
		this.engine = engine;
		this.imagedata = game.data.generated.config.imagedata;
		this.spriteCollector = [];
	}

	process(spriteDefinitions, spriteProvider, nowSec) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		spriteDefinitions.forEach((definition, definitionIndex) => this.processSpriteDefinition(definition, definitionIndex, spriteProvider, spriteCollector, nowSec));
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteProvider, spriteCollector, nowSec) {
		const { game, engine, imagedata } = this;
		const { src, type, animation, pos, mov, gravity, count } = definition;
		const totalCount = game.evaluate(count) || 1;

		for (let instanceIndex = 0; instanceIndex < totalCount; instanceIndex ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, instanceIndex);

			const spriteSrc = game.evaluate(src, instanceIndex);
			const spriteType = game.evaluate(type, instanceIndex);
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
				const { frame, range, frameRate, cols, rows } = animation;
				const animFrame = 		game.evaluate(frame, instanceIndex) || 0;
				const animRange = 		game.evaluate(range, instanceIndex) || 1;
				const animFrameRate = 	game.evaluate(frameRate, instanceIndex) || 15;
				const animCols = 		game.evaluate(cols, instanceIndex) || 1;
				const animRows = 		game.evaluate(rows, instanceIndex) || 1;

				const spriteAnim = sprite.animation;
				if (spriteAnim.frame !== animFrame || spriteAnim.range !== animRange
					|| spriteAnim.frameRate !== animFrameRate
					|| spriteAnim.cols !== animCols || spriteAnim.rows !== animRows) {
					spriteAnim.frame = animFrame;
					spriteAnim.range = animRange;
					spriteAnim.frameRate = animFrameRate;
					spriteAnim.cols = animCols;
					spriteAnim.rows = animRows;
					sprite.updated = nowSec;
				}
			}
		}
	}
}