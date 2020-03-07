SceneManager.add({
	name: "demo",
	firstScene: true,
	init: (game, scene) => {
		const { sceneData } = game;
		sceneData.cam = [0, 0, 0];
		sceneData.turn = 0;
	},
	refresh: (game, scene) => {
		const { sceneData, keyboard } = game;
		if (keyboard.controls.up > 0) {
			sceneData.cam[2] += .1;
		}
		if (keyboard.controls.down > 0) {
			sceneData.cam[2] -= .1;
		}
		if (keyboard.controls.left > 0) {
			sceneData.cam[0] += .1;
		}
		if (keyboard.controls.right > 0) {
			sceneData.cam[0] -= .1;			
		}
	},
	keyboard: {
		onKeyPress: (game, key) => {},
		onLeftPress: (game) => {},
		onRightPress: (game) => {},
		onDownPress: (game) => {},
		onUpPress: (game) => {},
	},
	settings: {
		docBackground: 0,
		background: 0x080523,
		curvature: 5,
	},
	view: {
		pos: [
			game => game.sceneData.cam[0],
			game => game.sceneData.cam[1],
			game => game.sceneData.cam[2],
		],
		angle: 45,
		height: 1,
		turn: game => game.sceneData.turn,
	},
	sprites: [
		{
			src: "icefloor.jpg",
			type: SpriteType.Floor,
			pos: [
				(game, sprite, index) => (Math.floor(index % 40) - 20) * 1,
				-.5,
				(game, sprite, index) => (Math.floor(index / 40) - 20) * 1,
			],
			grid: [40, 40],
			animation: {
				frame: (game, sprite, index) => index % 1600,
				range: 1600,
				frameRate: 0,
			},
			size: [1.0, 1.0],
			count: 1600,
		},
		{
			src: "dobuki",
			pos: [
				(game, sprite, index) => Math.sin(game.now/10000 + index),
				(game, sprite, index) => Math.cos(game.now/10000 + index/100) * .5,
				(game, sprite, index) => Math.cos(game.now/10000 + index),
			],
			size: [.2, .2],
			count: 100,
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
			init: (game, definition, index) => {},
			refresh: (game, definition, index) => {},
		},
	],
});