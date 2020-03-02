sceneManager.add({
	name: "intro",
	background: 0x220000,
	view: {
		pos: [0, 0, 0],
		angle: 45,
		height: 0,
		turn: 0,
	},
	sprites: [
		{
			src: "dobuki",
			pos: [
				({timeMillis}, sprite, index) => Math.sin(timeMillis/10000 + index),
				({timeMillis}, sprite, index) => .5 * Math.cos(timeMillis/10000 + index/100),
				({timeMillis}, sprite, index) => -1 + Math.cos(timeMillis/10000 + index),
			],
			size: [.1, .1],
			count: 1500,
		},
		{
			src: "yupa-dance",
			pos: [0, 0, -1],
			animation: {
				range: 8,
				frameRate: 4,
			},
			grid: [4, 4],
		},
	],
});