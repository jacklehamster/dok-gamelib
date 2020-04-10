class TextUtils {
	static makeSprite({position, tintColor, fontId, scale, text, letterDistance, faceUser}) {
		let cachedText = null;
		let cachedFontId = null;
		let font = null;
		const letterPositions = [];
		const indices = [];
		return {
			src: fontId || (() => game.getFirstFontName()),
			tintColor,
			scale,
			text,
			faceUser,
			position: position || [0, 0, 0],
			letterDistance,
			refresh: ({game, definition}) => {
				const text = definition.text.get(), src = definition.src.get();
				if (cachedText !== text || cachedFontId !== src) {
					cachedText = text;
					cachedFontId = src;
					letterPositions.length = 0;
					indices.length = 0;
					font = game.getFont(fontId);
					if (text.length > 0) {
						letterPositions[0] = 0;
						for (let i = 0; i < text.length; i++) {
							const letter = text.charAt(i);
							const { width, index } = font.letterInfo[letter];
							letterPositions[i+1] = letterPositions[i] + width;
							indices[i] = index;
						}
					}
				}
			},
			pos: [
				({game, definition}, index) => {
					const dx = definition.faceUser.get() ? Math.cos(game.view.turn.get()) : 1;
					return definition.position[0].get() + dx * definition.letterDistance.get() * (letterPositions[index] - .5);
				},
				({definition}, index) => definition.position[1].get(),
				({game, definition}, index) => {
					const dz = definition.faceUser.get() ? Math.sin(game.view.turn.get()) : 0;
					return definition.position[2].get() + dz * definition.letterDistance.get() * (letterPositions[index] - .5);
				}
			],
			animation: {
				frame: (dummy, index) => indices[index],
				range: () => font ? font.characters.length : 0,
				frameRate: 0,
			},
			grid: [
				() => Math.ceil(Math.sqrt(font.characters.length)),
				({definition}) => Math.ceil(font.characters.length / definition.grid[0].get()),
			],
			count: ({definition}) => indices.length,			
		};
	}
}