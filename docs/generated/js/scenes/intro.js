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
			animation: {
				range: 8,
				grid: [4, 4],
				frameRate: 4,
			},
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