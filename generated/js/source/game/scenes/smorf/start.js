SceneManager.add({
	init: ({game}) => {
		game.cam = [0, 0, 0];
		game.select = [0, 0, 0];
		game.mushrooms = [];
		game.smurfs = [];
		game.lastMov = 0;
		game.castle = [
			[-4, 3, 0],
		];
		game.castleGround = {};
		game.turn = {
			value: 0,
			goal: 0,
		};
		game.onCastle.run();
	},
	onCastle: ({game}) => {
		game.castleGround = {};
		game.castle.forEach(([x, y, z]) => {
			for (let xi = - 20; xi <= 20; xi++) {
				const px = Math.round(x + xi);
				const dist = 1 - Math.abs(xi) / 20;
				game.castleGround[px] = dist;
			}
		});
	},
	settings: {
		background: 0x99ffff,
	},
	view: {
		cameraDistance: 25,
		tilt: .8,
		turn: ({game}) => game.turn.value,
		pos: [
			({game}) => game.cam[0],
			-5,
			({game}) => game.cam[2],
		],
		depthEffect: {
			fading: .5,
		},
		curvature: 12,		
		viewPort: [
			1000,
			500,
		],
	},
	keyboard: {
		onActionPress: ({game}) => {
			game.mushrooms.push({
				x: game.select[0],
				z: game.select[2],
				born: game.now,
				hue: Math.random() * 2 - 1,
				nextSpawn: game.now + 5000,
			});
		},
	},
	refresh: ({game}) => {
		const { keys: { actions: { mov, turn } } } = game;

		//	turn camera
		const turnSpeed = .1;
		const turnStep = Math.PI / 8;
		if (turn) {
			game.turn.value += turn * turnSpeed;
			game.turn.goal = (Math.floor(game.turn.value / turnStep) + (turn > 0 ? 1 : 0)) * turnStep;
		} else {
			const turnDiff = game.turn.goal - game.turn.value;
			if (Math.abs(turnDiff) >= 0.01) {
				game.turn.value += turnDiff / 5;
			} else {
				game.turn.value = game.turn.goal = game.turn.goal % (Math.PI * 2);
			}
		}

		const speed = .4;
		if (mov.dist) {
			if (mov.x) {
				game.lastMov = mov.x;
			}
			const [ dx, dz ] = MotionUtils.getNormalDirection(game.turn.value, mov.x, mov.y);
			game.select[0] += dx * speed;
			game.select[2] += dz * speed;
		}
		MotionUtils.follow(game.cam, game.select[0], game.select[1], game.select[2], .1, 0);
	},
	spriteData: [
		{
			src: "smorf-pawer",
			spriteSize: [334, 330],
			grid: [3, 3],
			padding: 1,
			frameRate: 10,
			animations: [
				[ "shake", "0-6" ],
			],
		},
		{
			src: "smorf",
			spriteSize: [144, 178],
			grid: [2, 1],
			padding: 1,
			frameRate: 2,
			animations: [
				[ "walk", "0-1" ],
			],
		},
		{
			src: "handy",
			spriteSize: [144, 178],
			grid: [2, 1],
			padding: 1,
			frameRate: 5,
			animations: [
				[ "idle", "0" ],
				[ "walk", "0-1" ],
			],
		},
		{
			src: "smorf-tree",
			spriteSize: [288, 468],
			padding: 1,
		},
	],	
	sprites: [
		{
			src: "smorf-pawer",
			scale: [10, 10],
			pos: [
				({game}, index) => game.castle[index][0],
				({game}, index) => game.castle[index][1],
				({game}, index) => game.castle[index][2],
			],
			refresh: ({game}) => {
				const yPos = game.view.pos[2].get();
				for (let i = 0; i < game.castle.length; i++) {
					const elem = game.castle[i];
					if (elem[2] - yPos > 25) {
						elem[2] -= 50;
					} else if (elem[2] - yPos < -25) {
						elem[2] += 50;
					}
				}
			},
			count: ({game}) => game.castle.length,
		},
		{
			src: "smorf",
			hidden: ({game}, index) => {
				const xPos = game.view.pos[0].get();
				const smurf = game.smurfs[index];
				return Math.abs(smurf.x - xPos) > 30;
			},
			pos: [
				({game}, index) => game.smurfs[index].x,
				({game}, index) => .2 + .5 * (-Math.pow((Math.abs((game.now - game.smurfs[index].born) / 250))%2-1, 2)+1),
				({game}, index) => game.smurfs[index].z,
			],
			scale: [2,2],
			refresh: ({game}) => {
				const yPos = game.view.pos[2].get();
				for (let i = 0; i < game.smurfs.length; i++) {
					const smurf = game.smurfs[i];
					smurf.x+= .05;
					if (smurf.z - yPos > 25) {
						smurf.z -= 50;
					} else if (smurf.z - yPos < -25) {
						smurf.z += 50;
					}
				}
			},
			count: ({game}) => game.smurfs.length,
		},
		{
			src: "smorf2",
			pos: [
				({game, definition},index) => game.mushrooms[index].x,
				({game, definition},index) => Math.min(.8, -1 + (game.now - game.mushrooms[index].born) / 1000),
				({game, definition},index) => game.mushrooms[index].z,
			],
			scale: [ 8, 8 ],
			effects: {
				hue: ({game}, index) => game.mushrooms[index].hue,
			},
			count: ({game}) => game.mushrooms.length,
			refresh: ({game, definition}) => {
				const xPos = game.view.pos[0].get();
				const yPos = game.view.pos[2].get();
				for (let i = 0; i < game.mushrooms.length; i++) {
					const mushroom = game.mushrooms[i];
					if (mushroom.z - yPos > 25) {
						mushroom.z -= 50;
					} else if (mushroom.z - yPos < -25) {
						mushroom.z += 50;
					}

					if (game.now > mushroom.nextSpawn) {
						game.smurfs.push({
							born: game.now + Math.random()*1000,
							x: mushroom.x,
							z: mushroom.z,
						});
						mushroom.nextSpawn += 5000;
					}
				}
			},
		},
		{
			src: "artic",
			type: SpriteType.Floor,
			hidden: ({game}, index) => (game.now - game.mushrooms[index].born) > 2000,
			effects: {
				tintColor: 0x88000000,
			},
			scale: [
				8,
				8,
			],
			circleRadius: 1,
			pos: [
				({game, definition},index) => game.mushrooms[index].x,
				({game, definition},index) => .06,
				({game, definition},index) => game.mushrooms[index].z,
			],
			count: ({game}) => game.mushrooms.length,
		},
		{
			src: "artic",
			type: SpriteType.Floor,
			effects: {
				tintColor: 0x88FF99FF,
				brightness: 50,
			},
			scale: [
				3,
				3,
			],
			circleRadius: 1,
			pos: [
				({game, definition},index) => game.select[0],
				({game, definition},index) => .05,
				({game, definition},index) => game.select[2],
			],
		},
		{
			src: "handy",
			scale: [
				({game}) => game.lastMov < 0 ? -2 : 2,
				2,
			],
			pos: [
				({game, definition},index) => game.select[0],
				({game}, index) => {
					const { keys: { actions: { mov } } } = game;					
					return .2 + .5 * (-mov.dist * Math.pow((Math.abs((game.now) / 100))%2-1, 2)+1);
				},
				({game, definition},index) => game.select[2],
			],
			animation: ({game}) => {
				const { keys: { actions: { mov } } } = game;
				return mov.dist ? "walk": "idle";
			},
		},
		{
			src: "smorf-tree",
			scale: [10, 10],
			pos: [
				5,
				3,
				5,
			],
		},
		{
			init: ({definition}) => {
				definition.cols = 60;
				definition.rows = 60;
				definition.tiles = [];
				for (let y = 0; y < definition.rows; y++) {
					for (let x = 0; x < definition.cols; x++) {
						definition.tiles.push({
							x: (x - definition.cols / 2) * 2, y: (y - definition.rows / 2) * 2,
							corners: [
								Math.random()*.05,
								Math.random()*.05,
								Math.random()*.05,
								Math.random()*.05,
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
					if (tile.y - yPos > definition.rows) {
						tile.y -= definition.rows * 2;
					} else if (tile.y - yPos < -definition.rows) {
						tile.y += definition.rows * 2;
					}
					if (tile.x - xPos > definition.cols) {
						tile.x -= definition.cols * 2;
					} else if (tile.x - xPos < -definition.cols) {
						tile.x += definition.cols * 2;
					}
				}
			},
			src: "artic",
			type: SpriteType.Floor,
			farness: ({game, definition}, index) => game.castleGround[Math.round(definition.pos[0].get(index))] || 0,
			effects: {
				tintColor: 0xFF009900,
				brightness: ({game, definition}, index) => 20 + definition.farness.get(index) * 100,
			},
			scale: [2.2, 2.2],
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
	],
});