sceneManager.add({
	name: "intro",
	settings: {
		docBackground: 0xFFFFFF,
		background: 0xE0F0FF,
		curvature: 5,
	},
	view: {
		pos: [0, 0, 0],
		angle: 45,
		height: 1,
		turn: 0,
	},
	sprites: [
		{
			src: "dobuki",
			pos: [
				({now}, sprite, index) => Math.sin(now/10000 + index),
				({now}, sprite, index) => .5 * Math.cos(now/10000 + index/100),
				({now}, sprite, index) => Math.cos(now/10000 + index),
			],
			size: [.1, .1],
			count: 100,
		},
		{
			src: "icefloor.jpg",
			type: SpriteType.Floor,
			pos: [
				(evaluator, sprite, index) => (Math.floor(index % 20) - 10) * 1,
				-.5,
				(evaluator, sprite, index) => (Math.floor(index / 20) - 10) * 1
			],
			grid: [20, 20],
			animation: {
				frame: (evaluator, sprite, index) => index % 400,
				range: 400,
				frameRate: 0,
			},
			size: [1.01, 1.01],
			count: 400,
		},
		{
			src: "yupa-dance",
			pos: [0, -.5, 0],
			animation: {
				range: 8,
				frameRate: 4,
			},
			hotspot: [ 0, -.4 ],
			grid: [4, 4],
		},
	],
});