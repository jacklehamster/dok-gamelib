SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: {
				pos: [0, 1.5, 0],
				mov: { x: 0, y: 0, z: 0 },
				heightAboveGround: 0,
				speed: 0,
				grounded: true,
				flying: false,
			},
			cam: [ 0, 0, 0 ],
		};
		this.CLOSEFACTOR = 3;
		this.currentLevel = null;
		this.closeElement = null;
		this.levels = [
			{ name:"upper-level", height: 0, size: 16 },
			{ name:"lower-level", height:-2, size: 20 },
			{ name:"entrance", height:-2, size: 4 },
			{ name: "outside", height: 100 },
		];
		this.levelMap = {};
		this.levels.forEach(level => this.levelMap[level.name] = level);
		this.exiting = 0;

		this.robots = new Array(1).fill(null).map(_ => {
			return {
				command: {
					turn: -1,
					drive: 0,
				},
				motion: {
					turn: 0,
					mov: [0, 0, 0],
				},
				turn: 0,
				pos: [(Math.random()-.5) * 5, 0, (Math.random()-.5) * 5],
				nextCommand: 0,
			};
		});
	}

	handleRobot(robot) {
		const { motion, command, nextCommand, pos } = robot;
		if (this.now >= nextCommand) {
			if (Math.random() < .5) {
				command.turn = Math.sign(Math.random() - .5);
				command.drive = 0;
			} else {
				command.drive = 1;
				command.turn = 0;
			}
			robot.nextCommand += 500;
		}
		if (command.turn) {
			motion.turn += Math.sign(command.turn) * .005;
			motion.turn = Math.max(-.1, Math.min(.1, motion.turn));
		} else {
			motion.turn *= .9;
		}

		if (command.drive) {
			let [ movX, movZ ] = MotionUtils.getNormalDirection(-robot.turn, 0, command.drive);
			motion.mov[0] += movX * .03;
			motion.mov[2] += movZ * .03;
		} else {
			motion.mov[0] *= .9;
			motion.mov[2] *= .9;
		}

		let [ dx, _, dz ] = motion.mov;
		const motionDist = Math.sqrt(dx * dx + dz * dz);
		if (motionDist < .01) {
			robot.turn += motion.turn;
		}
		if (Math.abs(motion.turn) < .01) {
			const maxSpeed = .05;
			if (motionDist > 0) {
				dx = maxSpeed * dx / motionDist;
				dz = maxSpeed * dz / motionDist;
			}
			const [ posX, posY, posZ ] = pos;
			const diffHeight = this.diffHeight(posX, posZ, posX + dx, posZ + dz);
			if (diffHeight >= 1) {
				motion.mov[0] = -dx;
				motion.mov[2] = -dz;
			} else {
				pos[0] = posX + dx;
				pos[2] = posZ + dz;
			}
		}
	}

	diffHeight(fromX, fromZ, toX, toZ) {
		const preHeight = this.getHeight(fromX, 0, fromZ);
		const postHeight = this.getHeight(toX, 0, toZ);
		return postHeight - preHeight;
	}

	tryMoveBy(dx, dz) {
		const { sceneData: { dok } } = this;
		const shiftX = dx * dok.speed * (dok.flying ? 2 : 1);
		const shiftZ = dz * dok.speed * (dok.flying ? 2 : 1);

		const preHeight = this.getHeight(dok.pos[0], dok.pos[1], dok.pos[2]);
		const postHeight = this.getHeight(dok.pos[0] + shiftX, dok.pos[1], dok.pos[2] + shiftZ);

		const diffHeight = postHeight - preHeight;
		if (diffHeight === 0) {
			dok.pos[0] += shiftX;
			dok.pos[2] += shiftZ;
		} else if (diffHeight - dok.heightAboveGround < 0 || diffHeight - dok.heightAboveGround < 10 && dok.mov.y <= 0) {
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

	onPlatform(name) {
		if (name === "entrance") {
			this.exiting = this.now;
		}
	}

	onClosedTo(name) {
		console.log("close to", name)
	}

	loop() {
		this.robots.forEach(robot => this.handleRobot(robot));


		const { sceneData, keys: { actions: { mov, turn }, controls } } = this;
		const { dok } = sceneData;

		//	turn camera
		const turnSpeed = .03;
		const turnStep = Math.PI / 8;
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
			if (!this.tryMoveBy(dx, dz)) {
				this.tryAngled(dx, dz);
			}
		} else {
			sceneData.dok.speed = 0;
		}

		//	camera follow
		MotionUtils.follow(sceneData.cam, dok.pos[0] + dx * 4, dok.pos[1] + dok.heightAboveGround / 2, dok.pos[2] + dz * 4, .05, 0);
	}

	getPlatform(px, py, pz, distance) {
		if (!distance) {
			distance = 0;
		}
		for (let i = 0; i < this.levels.length - 1; i++) {
			const { name, height, size } = this.levels[i];
			if (!name) {
				break;
			}
			const definition = this.getDefinition(name);
			if (definition) {
				const centerX = definition.pos[0].get();
				const centerZ = definition.pos[2].get();
				const dx = centerX - px;
				const dz = centerZ - pz;
				const dist = Math.sqrt(dx * dx + dz * dz);
				if (dist < size / 2 + distance) {
					return this.levels[i];
				}
			}
		}
		return this.levels[this.levels.length - 1];
	}

	getHeight(px, py, pz) {
		const platform = this.getPlatform(px, py, pz);
		return platform ? platform.height : 0;
	}

	getCloseElement(px, py, pz) {
		return this.getPlatform(px, py, pz, this.CLOSEFACTOR);
	}

}}, {
	settings: {
		background: ({game: {now,exiting}}) => {
			const color = 0x888888;
			if (!exiting) {
				return color;
			}
			const coef = exiting ? (1 - (now - exiting) / 500) : 1;
			const [ r, g, b ] = ColorUtils.toRGB(color);
			return ColorUtils.fromRGB(r * coef, g * coef, b * coef);
		}
	},
	view: {
		tilt: .7,
		cameraDistance: 10,
		turn: ({game}) => game.sceneData.turn,
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1],
			({game}) => game.sceneData.cam[2],
		],
		depthEffect: {
			fading: ({game: {now,exiting}}) => exiting ? .7 + (now - exiting) / 500 : .7,
		},
	},
	light: {
		ambient: .9,
	},
	keyboard: {
		active: ({game}) => !game.exiting,
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			id: "wall",
			src: "blue-ground",
			padding: 20,
			grid: [10, 10],
		},
		{
			id: "arm",
			src: "arm",
			grid: [2, 2],
			frameRate: 24,
			animations: [
				[ "still", "1" ],
				[ "moving", "0-3" ],
			],
		},
		{
			id: "robo",
			src: "roboface",
			grid: [10, 1],
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
	],
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
			scale: [1, 1],
			animation: ({game, definition}, index) => {
				const dir = SpriteUtils.getOrientationCycle(0, game.view.turn.get(), game.robotDirections.length);
				return `idle-${game.robotDirections[dir]}`;
			},
		},
		{	//	upper level
			id: "upper-level",
			src: "wall",
			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size + .3,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [0, -1.15, 0],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => definition.size.get(),
			],
			effects: {
				brightness: 110,
			},
			fixed: true,
		},
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Back,
			cols: 40, rows: 2,
			radius: 8,
			center: [
				({game}) => game.getDefinition("upper-level").pos[0].get(),
				-2.65,
				({game}) => game.getDefinition("upper-level").pos[2].get(),
			],
			scale: [ 1.3, 1 ],
			brightness: 110,
			fixed: true,
		}),
		{
			id: "entrance",
			src: "wall",
			type: SpriteType.Floor,
			pos: [0, -3.155, 25],
			scale: [6, 6],
			effects: {
				brightness: ({game}) => game.getDefinition("lower-level").effects.brightness.get(),
			},
			fixed: true,			
		},
		{	//	floor
			id: "lower-level",
			src: "wall",
			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [0, -3.15, 15],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => definition.size.get(),
			],
			effects: {
				brightness: 50,
			},
			fixed: true,
		},

		ShapeUtils.cube({
			topSrc: "dirt-ground",
			sideSrc: "dirt-ground",
			position: [
				({game}, index) => game.robots[index].pos[0],
				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2],
			],
			rotationAngle: [
				0,
				({game}, index) => game.robots[index].turn,
				0,
			],
			cubeCount: ({game}) => game.robots.length,
		}),

		{
			src: "roboface",
			type: SpriteType.Front,
			pos: [
				({game}, index) => game.robots[index].pos[0],
				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2] + .501,
			],
			rotation: {
				angle: [
					0,
					({game}, index) => game.robots[index].turn,
					0,
				],
				center: [
					0,
					0,
					-.501,
				],
			},
			count: ({game}) => game.robots.length,
		},
		{
			src: "arm",
			type: SpriteType.RightWall,
			pos: [
				({game}, index) => game.robots[index].pos[0]-.51,
				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2],
			],
			animation: ({game},index) => game.robots[index].command.drive ? "moving" : "still",
			rotation: {
				angle: [
					0,
					({game}, index) => game.robots[index].turn,
					0,
				],
				center: [
					.51,
					0,
					0,
				],
			},
			count: ({game}) => game.robots.length,
		},
		{
			src: "arm",
			type: SpriteType.LeftWall,
			pos: [
				({game}, index) => game.robots[index].pos[0]+.51,
				({game, definition}, index) => -.3 + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2],
			],
			animation: ({game},index) => game.robots[index].command.drive ? "moving" : "still",
			scale: [-1, 1],
			rotation: {
				angle: [
					0,
					({game}, index) => game.robots[index].turn,
					0,
				],
				center: [
					-.51,
					0,
					0,
				],
			},
			count: ({game}) => game.robots.length,
		},
//			let [ movX, movZ ] = MotionUtils.getNormalDirection(-robot.turn, 0, command.drive);


		{
			src: "foot",
			cos: ({game},index) => .2 * (game.robots[index].command.drive * Math.cos(game.now / 50)),
			sin: ({game},index) => .2 * (game.robots[index].command.drive * Math.sin(game.now / 50)),
			scale: [.5,1],
			pos: [
				({game}, index) => game.robots[index].pos[0] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, -1, 0)[0],
				({game, definition}, index) => - .8 + definition.cos.get(index) + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, -1, 0)[1],
			],
			count: ({game}) => game.robots.length,
		},
		{
			src: "foot",
			cos: ({game},index) => .2 * (game.robots[index].command.drive * Math.cos(game.now / 50)),
			sin: ({game},index) => .2 * (game.robots[index].command.drive * Math.sin(game.now / 50)),
			scale: [.5,1],
			pos: [
				({game}, index) => game.robots[index].pos[0] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, 1, 0)[0],
				({game, definition}, index) => - .8 + definition.sin.get(index) + game.getHeight(game.robots[index].pos[0],0,game.robots[index].pos[2]),
				({game}, index) => game.robots[index].pos[2] + .3 * MotionUtils.getNormalDirection(-game.robots[index].turn, 1, 0)[1],
			],
			count: ({game}) => game.robots.length,
		},
	],
});