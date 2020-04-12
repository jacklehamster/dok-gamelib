SceneManager.add({}, {
	settings: {
		background: 0x000000,
	},
	view: {
		tilt: .4,
		cameraDistance: 10,
		turn: ({game}) => game.now / 1000,
	},
	sprites: [
		{
			src: "dok",
			scale: [292 / 150, 362 / 150],
			spriteSize: [292, 362],
			grid: [14, 8],
			padding: 1,
			animation: {
				range: 109,
			},
		},
		{
			src: "dok",
			type: SpriteType.Shadow,
			tintColor: 0xFF333333,
			scale: [292 / 150, 362 / 150],
			spriteSize: [292, 362],
			grid: [14, 8],
			padding: 1,
			animation: {
				range: 109,
			},
			hotspot: [0, .34],
			pos: [0, -1.15 + .01, 0],
		},
		{
			src: "home-floor",
			type: SpriteType.Floor,
			circleRadius: 1,
			tintColor: 0x88995555,
			pos: [0, -1.15, 0],
			scale: [10, 10],
			brightness: 80,
			padding: 2,
		},
	],
});