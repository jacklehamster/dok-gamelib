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
	sprites: [
		{
			src: "water.jpg",
			type: SpriteType.Water,
			tintColor: 0x889999FF,
			scale: [2, 2],
			brightness: 80,
			grid: [10, 10],
			padding: 1,
			animation: {
				start: ({game, definition}, index) => index,
				range: 1,
				frameRate: 0,
			},
			pos: [
				({game, definition}, index) => (index % 10 - 5) * 2,
				0,
				({game, definition}, index) => (Math.floor(index / 10) - 5) * 2,
			],
			count: 100,
		},
	],
});