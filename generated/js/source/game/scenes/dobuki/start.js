SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: {
				pos: [0, 1.5, 0],
				mov: { x: 0, y: 0, z: 0 },
				actionMov: { x: 0, y: 0, z: 0},
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
			{ name: "tree", height: 0, size: 1.5 },
			{ name:"bed", height: 1.2, size: 6 },
			{ name:"upper-level", height: 0, size: 16 },
			{ name:"lower-level", height:-2, size: 20 },
			{ name:"entrance", height:-2, size: 4 },
			{ name: "outside", height: 100 },
		];
		this.levelMap = {};
		this.levels.forEach(level => this.levelMap[level.name] = level);
		this.exiting = 0;
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
		} else if (diffHeight - dok.heightAboveGround < 0 || diffHeight - dok.heightAboveGround < 1 && dok.mov.y <= 0) {
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
//		console.log("close to", name)
	}

	loop() {
		const { sceneData, keys: { actions: { mov, turn }, controls }, socket } = this;
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

		if (dok.grounded || controls.action > 0 && !dok.flying) {
			if (controls.action > 0) {
				dok.mov.y = .25;
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
			}
		}

		if (!dok.flying) {
			const currentPlatform = this.getPlatform(...dok.pos);
			if (currentPlatform.name !== this.currentLevel) {
				this.currentLevel = currentPlatform.name;
				this.onPlatform(this.currentLevel);
			}
			const closeElement = this.getCloseElement(...dok.pos);
			if (closeElement.name !== this.closeElement) {
				this.closeElement = closeElement.name;
				this.onClosedTo(this.closeElement);
			}
		}

		dok.actionMov.x = mov.x;
		dok.actionMov.y = mov.y;
		dok.actionMov.z = mov.z;

		socket.update(dok);		

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
				const count = definition.count ? definition.count.get() : 1;
				for (let instanceIndex = 0; instanceIndex < count; instanceIndex++) {
					if (definition.shadow && definition.shadow.get(instanceIndex)) {
						continue;
					}
					const centerX = definition.pos[0].get(instanceIndex);
					const centerZ = definition.pos[2].get(instanceIndex);
					const dx = centerX - px;
					const dz = centerZ - pz;
					const dist = Math.sqrt(dx * dx + dz * dz);
					if (dist < size / 2 + distance) {
						return this.levels[i];
					}
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
			const color = 0x444422;
			if (!exiting) {
				return color;
			}
			const coef = exiting ? (1 - (now - exiting) / 500) : 1;
			const [ r, g, b ] = ColorUtils.toRGB(color);
			return ColorUtils.fromRGB(r * coef, g * coef, b * coef);
		},
		room: "dobuki",
	},
	view: {
		tilt: ({game: { view: { pos } }}) => pos[1].get() / 20 + .4,
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
	init: ({game}) => {
		game.socket.update(game.sceneData.dok);
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
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
			id: "wall",
			src: "home-floor",
			padding: 2.5,
			grid: [10, 10],
		},
		{
			id: "entrance-floor",
			src: "home-floor",
			padding: 2.5,
			grid: [5, 5],
		},
	],
	sprites: [
		{	//	upper level
			id: "bed",
			src: "home-floor",
			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size - 1,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [0, 0, 0],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => definition.size.get(),
			],
			effects: {
				tintColor: 0x88995555,
				brightness: 110,
				hue: .5,
			},
			fixed: true,
		},
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Back,
			cols: 40, rows: 1,
			radius: ({game}) => game.getDefinition("bed").size.get() / 2 -  .04,
			center: [
				({game}) => game.getDefinition("bed").pos[0].get(),
				-.5,
				({game}) => game.getDefinition("bed").pos[2].get(),
			],
			scale: [ .5, 1 ],
			tintColor: 0x88995555,
			brightness: 110,
			hue: .5,
			fixed: true,
		}),	
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Front,
			cols: 40, rows: 15,
			radius: ({game: { levelMap }, definition: {id}}) => levelMap['upper-level'].size / 2 + .05,
			center: [
				({game}) => game.getDefinition("upper-level").pos[0].get(),
				-1,
				({game}) => game.getDefinition("upper-level").pos[2].get(),
			],
			scale: [ 1.4, 1 ],
			brightness: 80,
			spherical: true,
			fixed: true,
			hidden: ({game, definition}, index) => {
				const floorDefinition = game.getDefinition("lower-level");
				if (floorDefinition) {
					const posX = definition.pos[0].get(index);
					const posZ = definition.pos[2].get(index);
					if (SpriteUtils.overlap(posX, posZ, floorDefinition, 0, .95)) {
						return true;
					}
				}
				return false;
			},
		}),
		{	//	upper level
			id: "upper-level",
			src: "home-floor",
			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size + .3,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [0, -1.15, 0],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => definition.size.get(),
			],
			effects: {
				tintColor: 0x88995555,
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
			tintColor: 0x88995555,
			brightness: 110,
			fixed: true,
		}),
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Front,
			cols: 80, rows: 10,
			radius: ({game}) => game.getDefinition("lower-level").size.get() / 2 - .2,
			center: [
				({game}) => game.getDefinition("lower-level").pos[0].get(),
				-2.65,
				({game}) => game.getDefinition("lower-level").pos[2].get(),
			],
			scale: [ .8, 1 ],
			brightness: 80,
			hidden: ({game, definition}, index) => {
				const posX = definition.pos[0].get(index);
				const posZ = definition.pos[2].get(index);
				if (SpriteUtils.overlap(posX, posZ, game.getDefinition("upper-level"), 0, .97)
					|| SpriteUtils.overlap(posX, posZ, game.getDefinition("entrance"), 0, .5)) {
					return true;
				}
				return false;
			},			
			fixed: true,
		}),
		{
			id: "entrance",
			src: "entrance-floor",
			type: SpriteType.Floor,
			pos: [0, -3.155, 25],
			scale: [6, 6],
			effects: {
				brightness: ({game}) => game.getDefinition("lower-level").effects.brightness.get(),
				hue: ({game}) => game.getDefinition("lower-level").effects.hue.get(),
			},
			fixed: true,			
		},
		{	//	floor
			id: "lower-level",
			src: "home-floor",
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
				hue: 1.1,
			},
			fixed: true,
		},
		SpriteUtils.makeSprite({
			src: "dok",
			data: {
				currentDok: ({game}, index) => {
					return game.socket.getSharedData(index);
				},
			},
			position: [
				({definition: {data: {currentDok}}}, index) => currentDok.get(index).pos[0],
				({definition: {data: {currentDok}}}, index) => currentDok.get(index).pos[1],
				({definition: {data: {currentDok}}}, index) => currentDok.get(index).pos[2],
			],
			scale: [
				({definition: {data: {currentDok}}}, index) => (currentDok.get(index).mov.x || 1) * 2.4,
				2.4,
			],
			heightAboveGround: ({definition: {data: {currentDok}}}, index) => currentDok.get(index).heightAboveGround,
			animation: ({game: { active }, definition: {data: {currentDok}}}, index) => {
				const { flying, speed, grounded, mov, actionMov } = currentDok.get(index);
				if (flying) {
					return actionMov.y < 0 ? "jump-up" : "jump";
				}

				if (speed > .01 || !grounded) {
					return actionMov.y < 0 || (mov.z < 0 && !actionMov.x) ? "walk-up" : "walk";
				}

				return actionMov.y < 0 || (mov.z < 0 && !actionMov.x) ? "idle-up" : "idle";
			},
			shadowColor: 0xFF333333,
			spriteSize: [292, 362],
			spriteCount: ({game: { socket }}) => socket.dataCount(),
			// refresh: ({definition}) => {
			// 	if (typeof(window)==="undefined") {
			// 		const anim = definition.animation.get();
			// 		if (definition.animCache !== anim) {
			// 			definition.animCache = anim;
			// 			console.log(definition.animCache);
			// 		}
			// 	}
			// },
		}),
		SpriteUtils.makeSprite({
			init: ({game}) => {
				game.trees = [
					{
						position: [-8, -2, 17],
					},
					{
						position: [-6, -2, 14],
					},
					{
						position: [-6, -2, 20],
					},
				];
			},
			id: "tree",
			src: "tree",
			position: [
				({game}, index) => game.trees[index].position[0],
				({game}, index) => game.trees[index].position[1],
				({game}, index) => game.trees[index].position[2],
			],
			scale: [3, 3],
			shadowColor: 0xFF333333,
			fixed: true,
			spriteCount: ({game}) => game.trees.length,
		}),
		// SpriteUtils.makeSprite({
		// 	id: "tree",
		// 	src: "tree",
		// 	position: [
		// 		-6,
		// 		-2,
		// 		15-1,
		// 	],
		// 	scale: [3, 3],
		// 	shadowColor: 0xFF333333,
		// 	fixed: true,
		// }),
		// SpriteUtils.makeSprite({
		// 	id: "tree",
		// 	src: "tree",
		// 	position: [
		// 		-6,
		// 		-2,
		// 		21-1,
		// 	],
		// 	scale: [3, 3],
		// 	shadowColor: 0xFF333333,
		// 	fixed: true,
		// }),
	],
});