SceneManager.add({Game: class extends Game {
	constructor() {
		super();
	}

	loop() {
	}

}}, {
	settings: {
		background: 0x6666cc,
	},
	view: {
		cameraDistance: 15,
		pos: [
			0, 3, 0,
		],
		depthEffect: {
			fading: 1,
		},
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			src: "water.jpg",
			grid: [20, 20],
			padding: 1,
		},
	],	
	sprites: [
		{
			src: "water.jpg",
			type: SpriteType.Water,
			effects: {
				tintColor: 0x889999FF,
				brightness: 80,
				hue: ({game}) => Math.sin(game.now / 5000),
			},
			scale: [2, 2],
			animation: ({game, definition}, index) => index,
			pos: [
				({game, definition}, index) => (index % 20 - 10) * 2,
				0,
				({game, definition}, index) => (Math.floor(index / 20) - 10) * 2,
			],
			count: 400,
		},
	],
});