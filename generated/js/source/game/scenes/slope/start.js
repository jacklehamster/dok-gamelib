SceneManager.add({
	view: {
		cameraDistance: 15,
		pos: [
			0,
			3,
			({game}) => -game.now / 50,
		],
		depthEffect: {
			fading: 1,
		},
	},
	sprites: [
		{
			init: ({definition}) => {
				definition.cols = 40;
				definition.rows = 40;
				definition.tiles = [];
				for (let y = 0; y < 40; y++) {
					for (let x = 0; x < 40; x++) {
						definition.tiles.push({
							x: x - definition.cols / 2, y: y - definition.rows / 2,
							corners: [
								Math.random(),
								Math.random(),
								Math.random(),
								Math.random(),
							],
						});
					}
				}
			},
			refresh: ({game, definition}) => {
				const yPos = game.view.pos[2].get();
				for (let i = 0; i < definition.tiles.length; i++) {
					const tile = definition.tiles[i];
					if (tile.y - yPos > 10) {
						tile.y -= 40;
					}
				}
			},
			src: "artic",
			type: SpriteType.Floor,
			corners: [
				({definition}, index) => definition.tiles[index].corners[0],
				({definition}, index) => definition.tiles[index].corners[1],
				({definition}, index) => definition.tiles[index].corners[2],
				({definition}, index) => definition.tiles[index].corners[3],
			],
			pos: [
				({definition},index) => definition.tiles[index].x,
				({definition},index) => 0,
				({definition},index) => definition.tiles[index].y,
			],
			count: ({definition}) => definition.tiles.length,
		},
	],
});