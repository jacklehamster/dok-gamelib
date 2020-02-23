sceneManager.add({
	name: "intro",
	background: 0x000000,
	view: {
		pos: [0, 0, 0],
		angle: 45,
	},
	sprites: [
		{
			src: "yupa-dance",
			pos: [
				({timeMillis}, {index}) => Math.sin(timeMillis/500 + index),
				(a, {index}) => Math.cos(index/100),
				0,
			],
			animation: {
				range: 8,
				grid: [4, 4],
				frameRate: 4,
			},
			count: 100,
		},
		{
			src: "yupa-dance",
			pos: [-.1, -.1, 0],
			animation: {
				range: 8,
				grid: [4, 4],
				frameRate: 4,
			},
		},
	],
});