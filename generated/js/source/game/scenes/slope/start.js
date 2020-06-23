SceneManager.add({
	view: {
		cameraDistance: 15,
		lean: ({game}) => -game.ships[0].dx / 10,
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
				[ "still", "0" ],
				[ "burn", "0-2" ],
			],
		},
		{
			src: "smorf-tree",
			spriteSize: [288, 468],
			padding: 1,			
		},
	],
	keyboard: {
		onActionPress: ({game}) => {
			if (game.ships[0].paused) {
				game.ships[0].paused = false;
			}
			for (let i = 0; i < 20; i++) {
				game.missiles.push({
					x: game.ships[0].x + game.ships[0].dx * 3,
					z: game.ships[0].z - 1,
					dx: game.ships[0].dx / 3,
					time: game.now - i * 5,
				});
			}
		},
	},	
	init: ({game}) => {
		game.cam = {
			x: 0,
			z: 0,
		};
	},
	sprites: [
		{
			init: ({game, definition}) => {
				definition.cols = 60;
				definition.rows = 70;
				definition.tiles = [];
				for (let y = 0; y < definition.rows; y++) {
					for (let x = 0; x < definition.cols; x++) {
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
			src: "smorf-tree",
			type: SpriteType.Front,
			init: ({game, definition}) => {
				definition.trees = [];
				for (let i = 0; i < 30; i++) {
					const scale = Math.random() * 10;
					definition.trees.push({
						x:(Math.random() - .5) * 100,
						y: scale/2,
						z:- Math.random() * 100,
						scale,
					});
				}
			},
			refresh: ({game, definition}) => {
				const xPos = game.view.pos[0].get();
				const zPos = game.view.pos[2].get();
				for (let i = 0; i < definition.trees.length; i++) {
					const tree = definition.trees[i];
					if (tree.z - zPos > 10) {
						tree.z -= 70;
						tree.x = xPos + (Math.random()-.5) * 60;
						tree.scale = Math.random() * 10;
						tree.y = tree.scale/2;
					}
					if (tree.x - xPos > 30) {
						tree.x -= 60;
					} else if (tree.x - xPos < -30) {
						tree.x += 60;
					}
				}
			},
			pos: [
				({definition: {trees}}, index) => trees[index].x,
				({definition: {trees}}, index) => trees[index].y,
				({definition: {trees}}, index) => trees[index].z,
			],
			scale: [
				({definition: {trees}}, index) => trees[index].scale,
				({definition: {trees}}, index) => trees[index].scale * 1.5,
			],
			count: ({definition: {trees}}) => trees.length,
		},
		{
			src: "ship",
			init: ({game}) => {
				game.ships = [{
					x: 0,
					z: 0,
					dx: 0,
					dz: 0,
					paused: true,
				}];
			},
			pos: [
				({game: { ships }}, index) => ships[index].x + ships[index].dx * 2,
				1.5,
				({game: { ships }}, index) => ships[index].z + ships[index].dz * 2,
			],
			scale: [ 1.5, 1 ],
			rotation: {
				angle: [
					0,
					0,
					({game}, index) => -game.ships[index].dx / 2,
				],
			},
			refresh: ({game}, index) => {
				const { keys: { actions: { mov } }, ships, cam } = game;
				ships[0].dx += mov.x * .05;
				ships[0].dz += mov.y * .05;

				for (let i = 0; i < ships.length; i++) {
					const ship = ships[i];
					ship.dx *= .9;
					ship.dz *= .9;
					if (!ship.paused) {
						ship.x += ship.dx;
						ship.z += -1.2 + ship.dz * 2;
					}
				}
				cam.x += (ships[0].x - cam.x) / 5;
				cam.z += ((ships[0].z - 8) - cam.z) / 5;
			},
			animation: ({game}, index) => game.ships[index].paused ? "still" : "burn",
			count: ({game}, index) => game.ships.length,
		},
		{
			src: "artic",
			init: ({game}) => {
				game.missiles = [];
			},
			circleRadius: 1,
			pos: [
				({game}, index) => game.missiles[index].x,
				1,
				({game}, index) => game.missiles[index].z,
			],
			motion: {
				time: ({game}, index) => game.missiles[index].time,
				mov: [
					({game}, index) => game.missiles[index].dx,
					.02,
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