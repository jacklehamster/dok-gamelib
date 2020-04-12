class SpriteUtils {
	static makeSprite(params) {
		const { position, shadowColor, scale, spriteSize, grid, padding, src, animation } = params;

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
			({definition: { spriteSize, zoomValue, upperScale }}) => upperScale[0].get() * spriteSize[0].get() * zoomValue.get(),
			({definition: { spriteSize, zoomValue, upperScale }}) => upperScale[1].get() * spriteSize[1].get() * zoomValue.get(),
		];

		return {
				toSourceCode: editor => `SpriteUtils.makeSprite(${editor.formatCode(params)})`,
				src,
				type: (dummy, index) => index === 0 ? SpriteType.Sprite: SpriteType.Shadow,
				tintColor: (dummy, index) => index === 0 ? 0 : shadowColor || 0xFF000000,
				upperScale: scale || [1, 1],
				scale: realScale,
				zoomValue,
				spriteSize,
				grid,
				padding,
				animation,
				hotspot: [
					0,
					(dummy, index) => index === 0 ? 0 : .35,
				],
				position,
				pos: [
					({definition}) => definition.position[0].get(),
					({definition}, index) => definition.position[1].get() + (index===0 ? 0 : -1.15+.01),
					({definition}) => definition.position[2].get(),				
				],
				count: 2,
		};
	}
}