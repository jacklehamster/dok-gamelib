SceneManager.add({
	view: {
		cameraDistance: 15,
		lean: ({game}) => -game.ship.dx / 10,
		pos: [
			({game}) => game.cam.x,
			3,
			({game}) => game.cam.z,
		],
		depthEffect: {
			fading: 1,
		},
	},
	spriteData: [
		{
			src: "ship",
			spriteSize: [166, 84],
			grid: [1, 3],
			padding: 1,
			frameRate: 10,
			animations: [
				[ "burn", "0-2" ],
			],
		},
	],
	keyboard: {
		onActionPress: ({game}) => {
			for (let i = 0; i < 20; i++) {
				game.missiles.push({
					x: game.ship.x,
					z: game.ship.z - 1,
					time: game.now - i * 10,
				});
			}
		},
	},	
	init: ({game}) => {
		game.cam = {
			x: 0,
			z: 0,
		};
		game.ship = {
			x: 0,
			z: 0,
			dx: 0,
			dz: 0,
		};
		game.missiles = [];
	},
	sprites: [
		{
			init: ({game, definition}) => {
				definition.cols = 50;
				definition.rows = 50;
				definition.tiles = [];
				for (let y = 0; y < definition.cols; y++) {
					for (let x = 0; x < definition.rows; x++) {
						definition.tiles.push({
							x: x - definition.cols / 2, y: y - definition.rows / 2,
							corners: [
								Math.random(),
								Math.random(),
								Math.random(),
								Math.random(),
							],
						});
					}
				}
			},
			refresh: ({game, definition}) => {
				const xPos = game.view.pos[0].get();
				const yPos = game.view.pos[2].get();
				for (let i = 0; i < definition.tiles.length; i++) {
					const tile = definition.tiles[i];
					if (tile.y - yPos > 10) {
						tile.y -= definition.rows;
					}
					if (tile.x - xPos > definition.cols / 2) {
						tile.x -= definition.cols;
					} else if (tile.x - xPos < -definition.cols / 2) {
						tile.x += definition.cols;
					}
				}
				const { keys: { actions: { mov } }, ship, cam } = game;
				ship.dx += mov.x * .05;
				ship.dz += mov.y * .05;
				ship.dx *= .9;
				ship.dz *= .9;
				ship.x += ship.dx;
				ship.z += -1.5 + ship.dz * 2;

				cam.x += (ship.x - cam.x) / 5;
				cam.z += ((ship.z - 8) - cam.z) / 5;
			},
			src: "artic",
			type: SpriteType.Floor,
			corners: [
				({definition}, index) => definition.tiles[index].corners[0],
				({definition}, index) => definition.tiles[index].corners[1],
				({definition}, index) => definition.tiles[index].corners[2],
				({definition}, index) => definition.tiles[index].corners[3],
			],
			pos: [
				({definition},index) => definition.tiles[index].x,
				({definition},index) => 0,
				({definition},index) => definition.tiles[index].y,
			],
			count: ({definition}) => definition.tiles.length,
		},
		{
			src: "ship",
			pos: [
				({game}) => game.ship.x,
				1.5,
				({game}) => game.ship.z,
			],
			scale: [ 1.5, 1 ],
			rotation: {
				angle: [
					0,
					0,
					({game}) => -game.ship.dx / 2,
				],
			},
		},
		{
			src: "artic",
			circleRadius: 1,
			pos: [
				({game}, index) => game.missiles[index].x,
				1,
				({game}, index) => game.missiles[index].z,
			],
			motion: {
				time: ({game}, index) => game.missiles[index].time,
				mov: [
					0,
					0,
					-.5,
				],
				gravity: [
					0,
					0,
					0,
				]
			},	
			effects: {
				tintColor: 0xFF99AA00,
				brightness: 130,
			},
			refresh: ({game}) => {
				for (let i = game.missiles.length - 1; i >= 0; i--) {
					const {time, x, z} = game.missiles[i];
					if (game.now - time > 3000) {
						game.missiles[i] = game.missiles[game.missiles.length-1];
						game.missiles.pop();
					}
				} 
			},
			count: ({game}) => game.missiles.length,
		},
	],
});