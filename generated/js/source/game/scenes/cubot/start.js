SceneManager.add({
	settings: {
		background: ({game: {now,exiting}}) => {
			const color = 0x333333;
			if (!exiting) {
				return color;
			}
			const coef = exiting ? (1 - (now - exiting) / 500) : 1;
			const [ r, g, b ] = ColorUtils.toRGB(color);
			return ColorUtils.fromRGB(r * coef, g * coef, b * coef);
		}
	},
	view: {
		tilt: .9,
		cameraDistance: 10,
		turn: ({game}) => game.sceneData.turn,
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1],
			({game}) => game.sceneData.cam[2],
		],
		depthEffect: {
			fading: ({game: {now,exiting}}) => exiting ? .5 + (now - exiting) / 500 : .5,
		},
		viewPort: [
			600,
			500,
		],
	},
	light: {
		ambient: .9,
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1] + 10,
			({game}) => game.sceneData.cam[2],
		],
	},
	keyboard: {
		active: ({game}) => !game.exiting,
	},
	mouse: {
		onMouseMove: ({game}) => {

		},
	},
	spriteData: [
		{
			id: "wall",
			src: "blue-ground",
			padding: 20,
			grid: [10, 10],
		},
		// {
		// 	id: "arm",
		// 	src: "arm",
		// 	grid: [2, 2],
		// 	frameRate: 24,
		// 	animations: [
		// 		[ "still", "1" ],
		// 		[ "moving", "0-3" ],
		// 	],
		// },
		// {
		// 	id: "robo",
		// 	src: "roboface",
		// 	grid: [10, 1],
		// },
		{
			src: "robot",
			grid: [6, 6],
			frameRate: 10,
			animations: [
				["idle-down", "0"],
				["walk-down","0-3"],
				["idle-down-right", "4"],
				["walk-down-right","4-7"],
				["idle-right", "8"],
				["walk-right","8-11"],
				["idle-up-right", "12"],
				["walk-up-right","12-15"],
				["idle-up", "16"],
				["walk-up","16-19"],
				["idle-up-left", "20"],
				["walk-up-left","20-23"],
				["idle-left", "24"],
				["walk-left","24-27"],
				["idle-down-left", "28"],
				["walk-down-left","28-31"],
			],
		},
	],
	refresh: ({game}) => {
		const { sceneData, keys: { actions: { mov, turn }, controls } } = game;

		//	turn camera
		const turnSpeed = .08;
		const turnStep = Math.PI / 2;
		if (turn) {
			sceneData.turn += turn * turnSpeed;
			sceneData.turnGoal = (Math.floor(sceneData.turn / turnStep) + (turn > 0 ? 1 : 0)) * turnStep;
		} else {
			const turnDiff = sceneData.turnGoal - sceneData.turn;
			if (Math.abs(turnDiff) >= 0.01) {
				sceneData.turn += turnDiff / 5;
			} else {
				sceneData.turn = sceneData.turnGoal = sceneData.turnGoal % (Math.PI * 2);
			}
		}
	},
	init: ({game}) => {
		game.sceneData = {
			turn: 0,
			turnGoal: 0,
			cam: [ 0, 0, 0 ],
		};
		game.maps = `
			...........
			...........
			....XXX....
			....XBX....
			....X_X....
			....X_X....
			.XXXX_XXXX.
			.X _____EX.
			.XXXXXXXXX.
			...........
			...........
			...........
		`.trim().split("\n").map(line => {
			return line.trim().split("");
		});
		game.bot = { x: 0, y: 0 };
		game.exit = { x: 0, y: 0 };

		const { maps, bot, exit } = game;


		for (let y = 0; y < maps.length; y++) {
			for (let x = 0; x < maps[y].length; x++) {
				const indic = maps[y][x];
				if (indic === 'B') {
					bot.x = x;
					bot.y = y;
				}
				if (indic === 'E') {
					exit.x = x;
					exit.y = y;
				}
			}
		}

		game.leftShift =  - Math.floor(maps[0].length / 2);
		game.topShift = - Math.floor(maps.length / 2);
	},
	sprites: [
		{
			id: "robot",
			src: "robot",
			init: ({game}) => {
				game.robotDirections = [
					"down",
					"down-left",
					"left",
					"up-left",
					"up",
					"up-right",
					"right",
					"down-right",
				];
			},
			scale: [.8, .8],
			pos: [
				({game}) => game.bot.x + game.leftShift,
				.5,
				({game}) => game.bot.y + game.topShift,
			],
			animation: ({game, definition}, index) => {
				const dir = SpriteUtils.getOrientationCycle(0, game.view.turn.get(), game.robotDirections.length);
				return `idle-${game.robotDirections[dir]}`;
			},
		},
		{
			src: "wall",
			type: SpriteType.Floor,
			hidden: ({game: {maps}, definition: {mapX, mapY}}, index) => maps[mapY.get(index)][mapX.get(index)] === " ",
			effects: {
				brightness: ({game: {maps}, definition: {mapX, mapY}}, index) => {
					const indic = maps[mapY.get(index)][mapX.get(index)];
					const dx = mapX.get(index) - maps[0].length / 2;
					const dy = mapY.get(index) - maps.length / 2;
					const dist = Math.sqrt(dx * dx + dy * dy);

					return indic === "E" ? 200 : indic === "_" ? 160 : indic === "B" ? 200 : 200 - dist * 20;
				},
				curvature: 1,
				hue: ({game: {maps}, definition: {mapX, mapY}}, index) => {
					const indic = maps[mapY.get(index)][mapX.get(index)];
					return indic === "E" ? 1.1 : indic === "_" ? .75 : indic === "B" ? .5 : 1;
				},
			},
			mapX: ({game: {maps}}, index) => index % maps[0].length,
			mapY: ({game: {maps}}, index) => Math.floor(index / maps[0].length) % maps.length,
			pos: [
				({game: {maps, leftShift}, definition}, index) => definition.mapX.get(index) + leftShift,
				0,
				({game: {maps, topShift}, definition}, index) => definition.mapY.get(index) + topShift,
			],
			count: ({game}) => {
				return game.maps.length * game.maps[0].length;
			}
		},
		ShapeUtils.cube({
			topSrc: ({game: {sceneData}}, index) => "dirt-ground",
			sideSrc: "dirt-ground",
			data: {
				mapX: ({game: {maps, leftShift}}, index) => index % maps[0].length,
				mapY: ({game: {maps, leftShift}}, index) => Math.floor(index / maps[0].length) % maps.length,
			},
			position: [
				({game: {maps, leftShift}, definition}, index) => definition.data.mapX.get(index) + leftShift,
				.2,
				({game: {maps, topShift}, definition}, index) => definition.data.mapY.get(index) + topShift,
			],
			cubeCount: ({game}) => game.maps.length * game.maps[0].length,
			hidden: ({game: {maps}, definition: { data: {mapX, mapY}}}, index) => maps[mapY.get(index)][mapX.get(index)] !== "X",
			brightness: ({definition}, index) => 120 + 15 * definition.position[1].get(index),
		}),

// 		{	//	upper level
// 			id: "upper-level",
// 			src: "wall",
// 			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size + .3,
// 			type: SpriteType.Floor,
// 			circleRadius: 1,
// 			pos: [0, -1.15, 0],
// 			scale: [
// 				({definition}) => definition.size.get(),
// 				({definition}) => definition.size.get(),
// 			],
// 			effects: {
// 				brightness: 110,
// 			},
// 			fixed: true,
// 		},
// 		ShapeUtils.cylinder({
// 			src: "wall",
// 			type: SpriteType.Back,
// 			cols: 40, rows: 2,
// 			radius: 8,
// 			center: [
// 				({game}) => game.getDefinition("upper-level").pos[0].get(),
// 				-2.65,
// 				({game}) => game.getDefinition("upper-level").pos[2].get(),
// 			],
// 			scale: [ 1.3, 1 ],
// 			brightness: 110,
// 			fixed: true,
// 		}),
// 		{
// 			id: "entrance",
// 			src: "wall",
// 			type: SpriteType.Floor,
// 			pos: [0, -3.155, 25],
// 			scale: [6, 6],
// 			effects: {
// 				brightness: ({game}) => game.getDefinition("lower-level").effects.brightness.get(),
// 			},
// 			fixed: true,			
// 		},
// 		{	//	floor
// 			id: "lower-level",
// 			src: "wall",
// 			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size,
// 			type: SpriteType.Floor,
// 			circleRadius: 1,
// 			pos: [0, -3.15, 15],
// 			scale: [
// 				({definition}) => definition.size.get(),
// 				({definition}) => definition.size.get(),
// 			],
// 			effects: {
// 				brightness: 50,
// 			},
// 			fixed: true,
// 		},

// 		ShapeUtils.cube({
// 			topSrc: "dirt-ground",
// 			sideSrc: "dirt-ground",
// 			position: [
// 				({game}, index) => game.robots[index].pos[0],
// 				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2],
// 			],
// 			rotationAngle: [
// 				0,
// 				({game}, index) => game.robots[index].turn,
// 				0,
// 			],
// 			cubeCount: ({game}) => game.robots.length,
// 		}),

// 		{
// 			src: "roboface",
// 			type: SpriteType.Front,
// 			pos: [
// 				({game}, index) => game.robots[index].pos[0],
// 				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2] + .501,
// 			],
// 			rotation: {
// 				angle: [
// 					0,
// 					({game}, index) => game.robots[index].turn,
// 					0,
// 				],
// 				center: [
// 					0,
// 					0,
// 					-.501,
// 				],
// 			},
// 			count: ({game}) => game.robots.length,
// 		},
// 		{
// 			src: "arm",
// 			type: SpriteType.RightWall,
// 			pos: [
// 				({game}, index) => game.robots[index].pos[0]-.51,
// 				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2],
// 			],
// 			animation: ({game},index) => game.robots[index].command.drive ? "moving" : "still",
// 			rotation: {
// 				angle: [
// 					0,
// 					({game}, index) => game.robots[index].turn,
// 					0,
// 				],
// 				center: [
// 					.51,
// 					0,
// 					0,
// 				],
// 			},
// 			count: ({game}) => game.robots.length,
// 		},
// 		{
// 			src: "arm",
// 			type: SpriteType.LeftWall,
// 			pos: [
// 				({game}, index) => game.robots[index].pos[0]+.51,
// 				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2],
// 			],
// 			animation: ({game},index) => game.robots[index].command.drive ? "moving" : "still",
// 			scale: [-1, 1],
// 			rotation: {
// 				angle: [
// 					0,
// 					({game}, index) => game.robots[index].turn,
// 					0,
// 				],
// 				center: [
// 					-.51,
// 					0,
// 					0,
// 				],
// 			},
// 			count: ({game}) => game.robots.length,
// 		},
// //			let [ movX, movZ ] = MotionUtils.getNormalDirection(-robot.turn, 0, command.drive);


// 		{
// 			src: "foot",
// 			cos: ({game},index) => .2 * (game.robots[index].command.drive * Math.cos(game.now / 50)),
// 			sin: ({game},index) => .2 * (game.robots[index].command.drive * Math.sin(game.now / 50)),
// 			scale: [.5,1],
// 			pos: [
// 				({game}, index) => game.robots[index].pos[0] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, -1, 0)[0],
// 				({game, definition}, index) => - .8 + definition.cos.get(index) + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, -1, 0)[1],
// 			],
// 			count: ({game}) => game.robots.length,
// 		},
// 		{
// 			src: "foot",
// 			cos: ({game},index) => .2 * (game.robots[index].command.drive * Math.cos(game.now / 50)),
// 			sin: ({game},index) => .2 * (game.robots[index].command.drive * Math.sin(game.now / 50)),
// 			scale: [.5,1],
// 			pos: [
// 				({game}, index) => game.robots[index].pos[0] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, 1, 0)[0],
// 				({game, definition}, index) => - .8 + definition.sin.get(index) + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
// 				({game}, index) => game.robots[index].pos[2] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, 1, 0)[1],
// 			],
// 			count: ({game}) => game.robots.length,
// 		},
	],
});