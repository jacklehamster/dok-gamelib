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
				({timeMillis}, sprite, index) => Math.sin(timeMillis/10000 + index),
				({timeMillis}, sprite, index) => Math.cos(timeMillis/10000 + index/100),
				({timeMillis}, sprite, index) => Math.cos(timeMillis/10000 + index),
			],
			animation: {
				range: 8,
				frameRate: 4,
			},
			grid: [4, 4],
			size: [.2, .2],
			count: 500,
		},
		{
			src: "yupa-dance",
			pos: [0, 0, 0],
			animation: {
				range: 8,
				frameRate: 4,
			},
			grid: [4, 4],
		},
	],
});