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
			init: ({game, definition}) => {
				const count = definition.gridSize.get() * definition.gridSize.get();
				definition.particles = new Array(count).fill(null).map(() => {
					return {
						time: game.now + Math.random() * 10000,
						pos: [ (Math.random()-.5) * 2, 2, (Math.random()-.5) * 2 ],
						mov: [ (Math.random()-.5) * 2, 0, (Math.random()-.5) * 2 ],
					};
				});
			},
			refresh: ({game, definition}) => {
				for (let i = 0; i < definition.particles.length; i++) {
					if (game.now - definition.particles[i].time > 10000) {
						definition.particles[i].time += 10000;
					}
				}
			},
			src: "penguin",
			gridSize: 120,
			pos: [
				({definition}, index) => definition.particles[index].pos[0] * 5,
				({definition}, index) => definition.particles[index].pos[1] * 5,
				({definition}, index) => definition.particles[index].pos[2] * 5,
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
				time: ({game: {now}, definition}, index) => definition.particles[index].time,
				mov: [
					({definition}, index) => definition.particles[index].mov[0] * .001,
					({definition}, index) => definition.particles[index].mov[1] * .001,
					({definition}, index) => definition.particles[index].mov[2] * .001,
				],
				gravity: [0, -0.00001, 0],
			},
			count: ({definition}) => definition.particles.length,
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