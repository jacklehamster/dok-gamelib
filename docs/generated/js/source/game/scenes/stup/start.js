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
		{
			src: "penguin",
			grid: [4, 5],
		},
	],	
	sprites: [
		{
			src: "penguin",
			gridSize: 120,
			pos: [
				({game, definition}, index) => (index % definition.gridSize.get() - definition.gridSize.get()/2) * .1,
				({game, definition}, index) => 7 + (Math.floor(index / definition.gridSize.get()) - definition.gridSize.get()/2) * .1,
				-10,
			],
			scale: [ .2, .2 ],
			rotation: {
				angle: [
					0,
					0,
					Math.PI,
				],
			},
			motion: {
				time: ({game: {now}}, index) => Math.floor(now / 10000) * 10000 + index,
				mov: [0, .01, .005],
				gravity: [0, -0.00001, 0],
			},
			count: ({definition}) => definition.gridSize.get() * definition.gridSize.get(),
		},
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