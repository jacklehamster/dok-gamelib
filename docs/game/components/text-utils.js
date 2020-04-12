/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class TextUtils {
	static makeSprite(params) {
		const {position, tintColor, fontId, scale, text, letterDistance, lineDistance, faceUser} = params;
		let cachedText = null;
		let cachedFontId = null;
		let font = null;
		const letterPositions = [];
		const linePositions = [];
		const indices = [];
		return {
			toSourceCode: editor => `TextUtils.makeSprite(${editor.formatCode(params)})`,
			src: fontId || (() => game.getFirstFontName()),
			tintColor,
			scale,
			text,
			faceUser,
			position: position || [0, 0, 0],
			letterDistance: letterDistance || .2,
			lineDistance: lineDistance || .3,
			refresh: ({game, definition}) => {
				const text = definition.text.get().trim(), src = definition.src.get();
				if (cachedText !== text || cachedFontId !== src) {
					cachedText = text;
					cachedFontId = src;
					letterPositions.length = 0;
					indices.length = 0;
					font = game.getFont(fontId);
					if (text.length > 0) {
						letterPositions[0] = 0;
						linePositions[0] = 0;
						let y = 0, maxHeight = 0;
						for (let i = 0; i < text.length; i++) {
							const letter = text.charAt(i);
							if (letter === "\n") {
								letterPositions[i] = letterPositions[i+1] =0;
								linePositions[i] = y;
								indices[i] = -1;
								y += maxHeight;
								maxHeight = 0;
							} else {
								const { width, height, index } = font.letterInfo[letter];
								maxHeight = Math.max(maxHeight, height);
								letterPositions[i+1] = letterPositions[i] + Math.max(.1, width);
								linePositions[i] = y;
								indices[i] = index;
							}
						}
					}
				}
			},
			pos: [
				({game, definition}, index) => {
					const dx = definition.faceUser.get() ? Math.cos(game.view.turn.get()) : 1;
					return definition.position[0].get() + dx * definition.letterDistance.get() * (letterPositions[index] - .5);
				},
				({definition}, index) => definition.position[1].get() - definition.lineDistance.get() * linePositions[index],
				({game, definition}, index) => {
					const dz = definition.faceUser.get() ? Math.sin(game.view.turn.get()) : 0;
					return definition.position[2].get() + dz * definition.letterDistance.get() * (letterPositions[index] - .5);
				}
			],
			hidden: (dummy, index) => indices[index] < 0,
			animation: {
				frame: (dummy, index) => Math.max(0, indices[index]),
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