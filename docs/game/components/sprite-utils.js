/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SpriteUtils {
	static makeSprite(params) {
		const { position, heightAboveGround, shadowColor, spriteTint, scale, spriteSize, src, animation, init, refresh, refreshRate, hidden, spriteCount } = params;

		const zoomValue = ({definition}) => {
			const spriteWidth = definition.spriteSize[0].get(),
				  spriteHeight = definition.spriteSize[1].get();
			if (!spriteWidth || !spriteHeight) {
				return 1;
			}
			const maxSpriteSize = Math.max(spriteWidth, spriteHeight);
			return 1 / maxSpriteSize;
		};

		const realScale = [
			({definition: { spriteSize, zoomValue, upperScale, heightAboveGround }}, index) =>
				upperScale[0].get(Math.floor(index / 2)) * (spriteSize[0].get(Math.floor(index / 2)) || 1) * zoomValue.get(Math.floor(index / 2))
				* (index % 2 === 0 ? 1 : 1 / (1 + heightAboveGround.get(Math.floor(index / 2)) / 5)),
			({definition: { spriteSize, zoomValue, upperScale, heightAboveGround }}, index) =>
				upperScale[1].get(Math.floor(index / 2)) * (spriteSize[1].get(Math.floor(index / 2)) || 1) * zoomValue.get(Math.floor(index / 2))
				* (index % 2 === 0 ? 1 : 1 / (1 + heightAboveGround.get(Math.floor(index / 2)) / 5)),
		];

		return {
			toSourceCode: (_,editor) => `SpriteUtils.makeSprite(${editor.formatCode(params)})`,
			init,
			refresh,
			src,
			spriteHidden: hidden || false,
			spriteTint: spriteTint || 0,
			hidden: ({definition}, index) => definition.spriteHidden.get(Math.floor(index / 2)),
			type: (_, index) => index % 2 === 0 ? SpriteType.Sprite: SpriteType.Shadow,
			effects: {
				tintColor: ({definition}, index) => index % 2 === 0 ? definition.spriteTint.get(Math.floor(index/2)) : (shadowColor || 0xFF000000),
			},
			upperScale: scale || [1, 1],
			scale: realScale,
			zoomValue,
			spriteSize: spriteSize || [0, 0],
			spriteAnimation: animation || (() => null),
			animation: ({definition}, index) => definition.spriteAnimation.get(Math.floor(index / 2)),
			hotspot: [
				0,
				(_, index) => index % 2 === 0 ? 0 : .35,
			],
			position,
			heightAboveGround: heightAboveGround || (() => 0),
			pos: [
				({definition}, index) => definition.position[0].get(Math.floor(index / 2)),
				({definition}, index) => definition.position[1].get(Math.floor(index / 2))
				+ (index % 2 === 0 ? 0 : -1.15+.01) + (index % 2 === 0 ? (definition.heightAboveGround.get(Math.floor(index / 2)) || 0 ) : 0),
				({definition}, index) => definition.position[2].get(Math.floor(index / 2)),				
			],
			spriteCount: spriteCount || 1,
			count: ({definition}) => definition.spriteCount.get() * 2,
		};
	}
}