SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: {
				pos: [0, 0, 0],
				mov: { x: 0, y: 0, z: 0 },
				heightAboveGround: 0,
				speed: 0,
				grounded: true,
				flying: false,
			},
			cam: [ 0, 0, 0 ],
		};
		this.levels = [
			{ name:"upper-level", height:0 },
			{ name:"lower-level", height:-2 },
			{ height: 100 },
		];
	}

	tryMoveBy(dx, dz) {
		const { sceneData: { dok } } = this;
		const shiftX = dx * dok.speed * (dok.flying ? 1.6 : 1);
		const shiftZ = dz * dok.speed * (dok.flying ? 1.6 : 1);

		const preHeight = this.getHeight(dok.pos[0], dok.pos[2]);
		const postHeight = this.getHeight(dok.pos[0] + shiftX, dok.pos[2] + shiftZ);

		const diffHeight = postHeight - preHeight;
		if (diffHeight === 0) {
			dok.pos[0] += shiftX;
			dok.pos[2] += shiftZ;
		} else if (diffHeight - dok.heightAboveGround < 0 || diffHeight - dok.heightAboveGround < 1 && dok.mov.y <= 0) {
			dok.pos[0] += shiftX;
			dok.pos[2] += shiftZ;
			dok.pos[1] += diffHeight;
			dok.heightAboveGround -= diffHeight;
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

	loop() {
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
			}
			if (mov.y) {
				dok.mov.z = mov.y;
			}
		}
		dok.speed *= .8;

		if (dok.speed > .0001) {
			const [ dx, dz ] = MotionUtils.getNormalDirection(sceneData.turn, mov.x, mov.y);

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

		//	camera follow
		MotionUtils.follow(sceneData.cam, dok.pos[0], dok.pos[1] + dok.heightAboveGround / 2, dok.pos[2], .05, 0);
	}

	getHeight(px, pz) {
		for (let i = 0; i < this.levels.length - 1; i++) {
			const { name, height } = this.levels[i];
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
				if (dist < definition.size.get() / 2) {
					return height;
				}
			}
		}
		return this.levels[this.levels.length - 1].height;
	}

}}, {
	settings: {
		background: 0x668833,
	},
	view: {
		tilt: .4,
		cameraDistance: 10,
		turn: ({game}) => game.sceneData.turn,
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1],
			({game}) => game.sceneData.cam[2],
		],
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
			grid: [10, 8],
		},
	],
	sprites: [
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Front,
			cols: 40, rows: 8,
			radius: 8,
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
					const floorX = floorDefinition.pos[0].get();
					const floorZ = floorDefinition.pos[2].get();
					const floorRadius = floorDefinition.size.get() / 2;
					const posX = definition.pos[0].get(index);
					const posZ = definition.pos[2].get(index);
					const dx = floorX - posX;
					const dz = floorZ - posZ;
					const dist = Math.sqrt(dx*dx + dz*dz);
					return dist < floorRadius;
				}
				return false;
			},
		}),
		ShapeUtils.cylinder({
			src: "wall",
			type: SpriteType.Back,
			cols: 40, rows: 2,
			radius: 7.85,
			center: [
				({game}) => game.getDefinition("upper-level").pos[0].get(),
				-2.65,
				({game}) => game.getDefinition("upper-level").pos[2].get(),
			],
			scale: [ 1.25, 1 ],
			tintColor: 0x88995555,
			brightness: 110,
			fixed: true,
		}),
		// ShapeUtils.cylinder({
		// 	src: "wall",
		// 	type: SpriteType.Front,
		// 	cols: 40, rows: 8,
		// 	radius: ({game}) => game.getDefinition("lower-level").size.get() / 2 - .2,
		// 	center: [
		// 		({game}) => game.getDefinition("lower-level").pos[0].get(),
		// 		-2.65,
		// 		({game}) => game.getDefinition("lower-level").pos[2].get(),
		// 	],
		// 	scale: [ 2, 1 ],
		// 	tintColor: 0x88995555,
		// 	brightness: 110,
		// 	hidden: ({game, definition}, index) => {
		// 		const floorDefinition = game.getDefinition("upper-level");
		// 		if (floorDefinition) {
		// 			const floorX = floorDefinition.pos[0].get();
		// 			const floorZ = floorDefinition.pos[2].get();
		// 			const floorRadius = floorDefinition.size.get() / 2;
		// 			const posX = definition.pos[0].get(index);
		// 			const posZ = definition.pos[2].get(index);
		// 			const dx = floorX - posX;
		// 			const dz = floorZ - posZ;
		// 			const dist = Math.sqrt(dx*dx + dz*dz);
		// 			return dist < floorRadius;
		// 		}
		// 		return false;
		// 	},			
		// 	fixed: true,
		// }),
		{	//	upper level
			id: "upper-level",
			src: "home-floor",
			size: 16,
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
		{	//	floor
			id: "lower-level",
			src: "home-floor",
			size: 25,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [0, -3.15, 15],
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
		SpriteUtils.makeSprite({
			src: "dok",
			position: [
				({game: { sceneData: { dok: { pos } }}}) => pos[0],
				({game: { sceneData: { dok: { pos } }}}) => pos[1],
				({game: { sceneData: { dok: { pos } }}}) => pos[2],
			],
			scale: [
				({game: {sceneData: { dok: { mov } }}}) => (mov.x || 1) * 2.4,
				2.4,
			],
			heightAboveGround: ({game: { sceneData: { dok: { heightAboveGround } }}}) => heightAboveGround,
			animation: ({game: { keys: { actions }, sceneData: { dok: { speed, mov, flying, grounded } }}}) => {
				return flying ? (actions.mov.y < 0 ? "jump-up" : "jump") : (speed > .01 || !grounded) ? (actions.mov.y < 0 ? "walk-up" : "walk") : (actions.mov.y < 0 ? "idle-up" : "idle");
			},
			shadowColor: 0xFF333333,
			spriteSize: [292, 362],
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
			src: "tree",
			position: [-1, 0, -1],
			scale: [3, 3],
			shadowColor: 0xFF333333,
			fixed: true,
		}),
	],
});