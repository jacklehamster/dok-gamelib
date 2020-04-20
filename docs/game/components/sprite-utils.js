/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SpriteUtils {
	static makeSprite(params) {
		const { position, shadowColor, spriteTint, scale, spriteSize, src, animation, init, refresh, refreshRate, hidden, spriteCount } = params;

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
			({definition: { spriteSize, zoomValue, upperScale }}, index) => upperScale[0].get(Math.floor(index / 2)) * spriteSize[0].get(Math.floor(index / 2)) * zoomValue.get(Math.floor(index / 2)),
			({definition: { spriteSize, zoomValue, upperScale }}, index) => upperScale[1].get(Math.floor(index / 2)) * spriteSize[1].get(Math.floor(index / 2)) * zoomValue.get(Math.floor(index / 2)),
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
			tintColor: ({definition}, index) => index % 2 === 0 ? definition.spriteTint.get(Math.floor(index/2)) : (shadowColor || 0xFF000000),
			upperScale: scale || [1, 1],
			scale: realScale,
			zoomValue,
			spriteSize,
			spriteAnimation: animation || (() => null),
			animation: ({definition}, index) => definition.spriteAnimation.get(Math.floor(index / 2)),
			hotspot: [
				0,
				(_, index) => index % 2 === 0 ? 0 : .35,
			],
			position,
			pos: [
				({definition}, index) => definition.position[0].get(Math.floor(index / 2)),
				({definition}, index) => definition.position[1].get(Math.floor(index / 2)) + (index % 2 === 0 ? 0 : -1.15+.01),
				({definition}, index) => definition.position[2].get(Math.floor(index / 2)),				
			],
			spriteCount: spriteCount || 1,
			count: ({definition}) => definition.spriteCount.get() * 2,
		};
	}
}