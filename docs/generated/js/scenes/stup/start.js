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
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			src: "water.jpg",
			grid: [10, 10],
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
			},
			scale: [2, 2],
			animation: ({game, definition}, index) => index,
			pos: [
				({game, definition}, index) => (index % 10 - 5) * 2,
				0,
				({game, definition}, index) => (Math.floor(index / 10) - 5) * 2,
			],
			count: 100,
		},
	],
});