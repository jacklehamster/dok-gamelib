SceneManager.add({Game: class extends Game {
	constructor() {
		super();
	}

	tryMoveBy(dx, dz) {
		const { sceneData: { doks: [ dok ] } } = this;
		const shiftX = dx * dok.speed * (dok.flying ? .8 : .5);
		const shiftZ = dz * dok.speed * (dok.flying ? .8 : .5);

		const preHeight = this.getHeight(dok.pos[0], dok.pos[1], dok.pos[2]);
		const postHeight = this.getHeight(dok.pos[0] + shiftX, dok.pos[1], dok.pos[2] + shiftZ);

		const diffHeight = postHeight - preHeight;
		if (diffHeight === 0) {
			dok.pos[0] += shiftX;
			dok.pos[2] += shiftZ;
		} else if (diffHeight - dok.heightAboveGround < 0 || diffHeight - dok.heightAboveGround < .4 && dok.mov.y <= 0) {
			dok.pos[0] += shiftX;
			dok.pos[2] += shiftZ;
			dok.heightAboveGround = dok.pos[1] + dok.heightAboveGround - postHeight;
			dok.pos[1] = postHeight;
			dok.flying = true;
			dok.grounded = false;
		} else {
			return false;
		}
		return true;
	}

	tryAngled(dx, dz) {
		const angle = Math.atan2(dz, dx);
		{
			const cos = Math.cos(angle + 20);
			const sin = Math.sin(angle + 20);
			const dist = Math.sqrt(dx*dx + dz*dz);
			if (this.tryMoveBy(cos * dist, sin * dist)) {
				return true;
			}
		}
		{
			const cos = Math.cos(angle - 20);
			const sin = Math.sin(angle - 20);
			const dist = Math.sqrt(dx*dx + dz*dz);
			if (this.tryMoveBy(cos * dist, sin * dist)) {
				return true;
			}			
		}
		return false;
	}

	getHeight(px, py, pz) {
		const cell = this.getCell(px, pz);
		if (cell) {
			if (cell === "X") {
				return .5 + .8;
			}
			for (let i = 0; i < this.barrels.length; i++) {
				const barrelDx = this.barrels[i].x + this.leftShift - px;
				const barrelDy = this.barrels[i].y + this.topShift - pz;
				const barrelDist = Math.sqrt(barrelDx * barrelDx + barrelDy * barrelDy);
				if (barrelDist < .5) {
					return .5 + .5;
				}
			}

			const botDx = this.bot.x + this.leftShift - px;
			const botDy = this.bot.y + this.topShift - pz;
			const botDist = Math.sqrt(botDx * botDx + botDy * botDy);
			if (botDist < .5) {
				return .5 + .5;
			}

			if (cell === ".") {
				return .5;
			}
			if (cell === " ") {
				return -100;
			}
			return .5;
		}
		return -100;
	}

	getCell(x, z) {
		const ix = Math.round(x - this.leftShift);
		const iz = Math.round(z - this.topShift);
		if (this.maps[iz]) {
			return this.maps[iz][ix];
		}
		return null;
	}

}} , {
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
		{
			src: "dok",
			spriteSize: [292, 362],
			grid: [14, 8],
			padding: 1,
			frameRate: 24,
			animations: [
				[ "idle", "still*100,blink" ],
				[ "still", "2" ],
				[ "blink", "0*3,0-2,2*3" ],
				[ "talk", "2-5" ],
				[ "talk-mad", "6-7" ],
				[ "talk-surprised", "8-9" ],
				[ "talk-sad", "10-11" ],
				[ "talk-4th-wall", "12-15" ],
				[ "walk", "16-25" ],
				[ "idle-up", "26"],
				[ "walk-up", "27-37" ],
				[ "knocked-up", "38-53" ],
				[ "birds", "54-58" ],
				[ "cast-spell", "59-68" ],
				[ "pick-up", "69-79" ],
				[ "fly", "80-87" ],
				[ "dancing", "88-95" ],
				[ "jump", "16" ],
				[ "jump-up", "27" ],
			],
		},
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
		{
			src: "penguin",
			grid: [4, 5],
			animations: [
				["anim", "0-3"],
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

		const { doks: [dok] } = sceneData;

		//	move dobuki
		if (mov.dist > 0) {
			dok.speed += .02;
			if (mov.x) {
				dok.mov.x = mov.x;
				if (!mov.y) {
					dok.mov.z = 0;
				}
			}
			if (mov.y) {
				dok.mov.z = mov.y;
			}
		}
		dok.speed *= .8;

		const [ dx, dz ] = MotionUtils.getNormalDirection(sceneData.turn, mov.x, mov.y);
		if (dok.speed > .0001) {
			if (!game.tryMoveBy(dx, dz)) {
				game.tryAngled(dx, dz);
			}
		} else {
			dok.speed = 0;
		}

		if (dok.grounded || controls.action > 0 && !dok.flying) {
			if (controls.action > 0) {
				dok.mov.y = .14;
				dok.grounded = false;
				dok.flying = true;
			}
		} else {
			dok.mov.y -= controls.action > 0 ? .01 : .025;
			dok.heightAboveGround += dok.mov.y;
			if (dok.heightAboveGround <= 0) {
				dok.heightAboveGround = 0;
				dok.flying = false;
				if (dok.mov.y < -.35) {
					dok.mov.y = -dok.mov.y * .5;
				} else {
					dok.mov.y = 0;
					dok.grounded = true;
				}
				if (dok.pos[1] <= -100) {
					game.restart();
				}
			}
		}

		//	camera follow
		MotionUtils.follow(sceneData.cam, dok.pos[0] + dx, Math.max(-1, dok.pos[1] + dok.heightAboveGround / 2), dok.pos[2] + dz, .05, 0);
	},
	init: ({game}) => {
		game.sceneData = {
			turn: 0,
			turnGoal: 0,
			cam: [ 0, 0, 0 ],
			doks: [
				{
					pos: [0, 0.5, 0],
					mov: { x: 0, y: 0, z: 0 },
					heightAboveGround: 0,
					speed: 0,
					grounded: true,
					flying: false,
				},
			],
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
			.XXXXoXXXX.
			....X_X....
			....XXX....
			...........
		`.trim().split("\n").map(line => {
			return line.trim().split("");
		});
		game.barrels = [];
		game.bot = { x: 0, y: 0 };
		game.exit = { x: 0, y: 0 };

		const { maps, bot, exit, barrels } = game;


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
				if (indic === "o") {
					barrels.push({x, y});
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

					return indic === "E" ? 200 : indic === "_" || indic === "o" ? 160 : indic === "B" ? 200 : 200 - dist * 20;
				},
				curvature: 1,
				hue: ({game: {maps}, definition: {mapX, mapY}}, index) => {
					const indic = maps[mapY.get(index)][mapX.get(index)];
					return indic === "E" ? 1.1 : indic === "_" || indic === "o" ? .75 : indic === "B" ? .5 : 1;
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
			},
		},

		{
			src: "wall",
			size: .8,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [
				({game}, index) => game.barrels[index].x + game.leftShift,
				.45,
				({game}, index) => game.barrels[index].y + game.topShift,
			],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => definition.size.get(),
			],
			count: ({game}) => game.barrels.length,
		},
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Back,
			cols: 40, rows: 1,
			radius: ({game}) => .4,
			center: [
				({game},index) => game.barrels[0].x + game.leftShift,
				0,
				({game},index) => game.barrels[0].y + game.topShift,
			],
			scale: [ .1, 1 ],
			count: ({game}) => game.barrels.length,
		}),
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

		{
			init: ({game, definition}) => {
				const count = 1000;
				definition.particles = new Array(count).fill(null).map(() => {
					const time = game.now + Math.random() * 20000;
					const dist = (Math.cos(time / 137) + 1) / 2;
					return {
						time,
						pos: [ Math.cos(time / 20) * dist, 0, Math.sin(time / 20) * dist ],
						mov: [ -Math.cos(time / 20) * .00002, .001, -Math.sin(time / 20) * .00002 ],
						lockedUntil: time + 20000,
					};
				});
			},
			refresh: ({game, definition}) => {
				for (let i = 0; i < definition.particles.length; i++) {
					const expiration = definition.particles[i].time + 20000;
					if (game.now > expiration) {
						definition.particles[i].time += 20000;
						definition.particles[i].lockedUntil = expiration + 20000;
					}
				}
			},
			lockedUntil: ({definition}, index) => definition.particles[index].lockedUntil,
			src: "penguin",
			pos: [
				({game,definition}, index) => game.exit.x + .5 * definition.particles[index].pos[0] + game.leftShift,
				({game,definition}, index) => definition.particles[index].pos[1],
				({game,definition}, index) => game.exit.y + .5 * definition.particles[index].pos[2] + game.topShift,
			],
			scale: [ .08, .08 ],
			motion: {
				time: ({definition}, index) => definition.particles[index].time,
				mov: [
					({definition}, index) => definition.particles[index].mov[0],
					({definition}, index) => definition.particles[index].mov[1],
					({definition}, index) => definition.particles[index].mov[2],
				],
			},
			effects: {
				tintColor: 0x88FF99FF,
				brightness: 150,
			},
			animation: "anim",
			count: ({definition}) => definition.particles.length,
		},

		SpriteUtils.makeSprite({
			src: "dok",
			position: [
				({game: { sceneData: { doks }}}, index) => doks[index].pos[0],
				({game: { sceneData: { doks }}}, index) => doks[index].pos[1],
				({game: { sceneData: { doks }}}, index) => doks[index].pos[2],
			],
			scale: [
				({game: {sceneData: { doks }}}, index) => (doks[index].mov.x || 1),
				1,
			],
			heightAboveGround: ({game: { sceneData: { doks }}}, index) => doks[index].heightAboveGround,
			animation: ({game: { active, keys: { actions }, sceneData: { doks }}}, index) => {
				const { speed, mov, flying, grounded } = doks[index];
				if (flying) {
					return actions.mov.y < 0 ? "jump-up" : "jump";
				}

				if (speed > .01 || !grounded) {
					return actions.mov.y < 0 || (mov.z < 0 && !actions.mov.x) ? "walk-up" : "walk";
				}

				return actions.mov.y < 0 || (mov.z < 0 && !actions.mov.x) ? "idle-up" : "idle";
			},
			shadowColor: 0xFF777777,
			spriteSize: [292, 362],
			spriteCount: ({game: { sceneData: { doks } } }) => doks.length,
		}),
	],
});