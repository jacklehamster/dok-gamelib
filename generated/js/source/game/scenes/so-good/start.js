function makePlatform(p) {
	const platformId = p;
	return [{	//	upper level
		platformId,
		id: ({definition}) => definition.platformId.get(),
		src: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].top,
		size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size - 1,
		type: SpriteType.Floor,
		circleRadius: 1,
		pos: [
			({game: { levelMap }, definition: {id}}) => levelMap[id.get()].pos[0],
			({game: { levelMap }, definition: {id}}) => levelMap[id.get()].pos[1],
			({game: { levelMap }, definition: {id}}) => levelMap[id.get()].pos[2],
		],
		scale: [
			({definition}) => definition.size.get(),
			({definition}) => definition.size.get(),
		],
		effects: {
			tintColor: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].tintColor,
			brightness: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].brightness,
			hue: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].hue,
		},
		fixed: true,
	},
	ShapeUtils.cylinder({
		platformId,
		src: ({game: { levelMap }, definition: {id, platformId}}) => levelMap[platformId.get()].side,
		type: SpriteType.Back,
		cols: 40, rows: 1,
		radius: ({game, definition}) => game.getDefinition(definition.platformId.get()).size.get() / 2 -  .04,
		center: [
			({game, definition}) => game.getDefinition(definition.platformId.get()).pos[0].get(),
			-.5,
			({game, definition}) => game.getDefinition(definition.platformId.get()).pos[2].get(),
		],
		scale: [ .5, 1 ],
		tintColor: ({game, definition}) => game.getDefinition(definition.platformId.get()).effects.tintColor.get(),
		brightness: ({game, definition}) => game.getDefinition(definition.platformId.get()).effects.brightness.get(),
		hue: ({game, definition}) => game.getDefinition(definition.platformId.get()).effects.hue.get(),
		fixed: true,
	})];
}





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
		this.touched = false;
		this.levels = [
			{
				type: "sprite",
				name: "tree",
				height: 0,
				size: 1.5,
				scale: [3, 3],
				fixed: true,
				elems: [
					{
						position: [-8, -2, 17],
					},
					{
						position: [-6, -2, 14],
					},
					{
						position: [-6, -2, 20],
					},
				],
			},
			{
				type: "sprite",
				name: "hand",
				height: 1,
				size: 2,
				scale: [3, 3],
//				fixed: true,
				// elems: new Array(100).fill(null).map(() => {
				// 	return {
				// 		position: [
				// 			(Math.random()-.5)*20,
				// 			-2,
				// 			({game}, index) => Math.random() * 100,
				// 		],
				// 	};
				// }),
			},
			{
				type: "sprite",
				name: "mouth",
				height: 1,
				size: 2,
				scale: [3, 3],
//				fixed: true,
				// elems: new Array(100).fill(null).map(() => {
				// 	return {
				// 		position: [
				// 			(Math.random()-.5)*20,
				// 			-2,
				// 			({game}, index) => Math.random() * 100,
				// 		],
				// 	};
				// }),
			},
			{
				type: "sprite",
				name: "smorf",
				height: 0,
				size: 1.5,
				scale: [3, 3],
				fixed: true,
				elems: [
					{
						position: [8, -2, 17],
					},
				],
				message: "Hello",
			},
			{
				type: "cylinder",
				name: "bed",
				top: "eye-decor",
				side: "wall",
				level: 0,
				height: 1.2, size: 6,
				tintColor: 0x88995555,
				brightness: 110,
				hue: .5,
				pos: [0, 0, 0],
			},
			{
				type: "cylinder",
				name:"upper-level",
				top: "eye-decor",
				side: "wall",
				height: 0,
				size: 16,
			},
			{ name:"lower-level", height:-2, size: 20 },
			{ name:"entrance", height:-2, size: 4 },
			{ name: "outside", height: 100 },
		];
		this.levelMap = {};
		this.levels.forEach(level => this.levelMap[level.name] = level);
		this.exiting = 0;
		this.hands = new Array(100).fill(null).map(() => {
			return {
				x: (Math.random()-.5) * 15,
				y: -2.4,
				z: Math.random() * 300,
			};
		});
		this.mouths = new Array(30).fill(null).map(() => {
			return {
				x: (Math.random()-.5) * 15,
				y: -.5,
				z: Math.random() * 300,
			};
		});
		this.score = 0;
		this.highScore = 0;
	}

	tryMoveBy(dx, dz) {
		const { sceneData: { dok } } = this;
		if (this.kicked) {
			return true;
		}

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

	onPlatform(name, index) {
		if (name === "entrance") {
//			this.exiting = this.now;
		}
	}

	onClosedTo(name, index) {
		const lvl = this.levelMap[name];		
		if (lvl) {
			if (lvl.message) {
				console.log(lvl.message);
			}
		}
	}

	onTouch(name, index, x, z) {
		// if (name === "hand" || name === "mouth") {
		// 	const { dok } = this.sceneData;
		// 	this.kicked = this.now;
		// 	dok.mov.x = 0;//x > dok.pos[0] ? -1 : 1;
		// 	dok.mov.z = 0;
		// 	dok.mov.y = 3;
		// 	console.log(name);
		// }
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

		const [ dx, dz ] = MotionUtils.getNormalDirection(sceneData.turn, mov.x, mov.y);
		if (!this.kicked) {
			//	move dobuki
			if (mov.dist > 0) {
				dok.speed += .03;
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

			if (dok.speed > .0001) {
				if (!this.tryMoveBy(dx, dz)) {
					this.tryAngled(dx, dz);
				}
			} else {
				sceneData.dok.speed = 0;
			}

			if (dok.grounded || controls.action > 0 && !dok.flying) {
				if (controls.action > 0) {
					dok.mov.y = .2;
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
			if (dok.pos[0] < -15) {
				dok.pos[0] = -15;
			}
			if (dok.pos[0] > 15) {
				dok.pos[0] = 15;
			}
		} else {
			dok.flying = true;
			dok.pos[0] += dok.mov.x;
			dok.pos[1] += dok.mov.y;
			dok.mov.y -= .03;
			if (dok.mov.y < 0 && dok.pos[1] < 0) {
				this.kicked = 0;

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
				this.highScore = Math.max(this.highScore, this.score);
				this.score = 0;
				return;
			}
		}

		if (!dok.flying) {
			const [currentPlatform, platformIndex] = this.getPlatform(...dok.pos);
			if (currentPlatform.name !== this.currentLevel) {
				this.currentLevel = currentPlatform.name;
				this.onPlatform(this.currentLevel, platformIndex);
			}
			const [closeElement, elementIndex] = this.getCloseElement(...dok.pos);
			if (closeElement.name !== this.closeElement) {
				this.closeElement = closeElement.name;
				this.onClosedTo(this.closeElement, elementIndex);
			}

			//	collision
			const distance = .1;
			const definition = this.getDefinition(this.closeElement);
			if (definition) {
				if (!definition.shadow || !definition.shadow.get(elementIndex)) {
					const centerX = definition.pos[0].get(elementIndex);
					const centerZ = definition.pos[2].get(elementIndex);
					const dx = centerX - dok.pos[0];
					const dz = centerZ - dok.pos[2];
					const dist = Math.sqrt(dx * dx + dz * dz);
					const newTouched = dist < this.levelMap[this.closeElement].size / 2 + distance;
					if (this.touched !== newTouched) {
						this.touched = newTouched;
						if (this.touched) {
							this.onTouch(this.closeElement, elementIndex, centerX, centerZ);
						}
					}
				}
			}
		}

		dok.actionMov.x = mov.x;
		dok.actionMov.y = mov.y;
		dok.actionMov.z = mov.z;

		socket.update(dok);		

		for (let i = 0; i < this.hands.length; i++) {
			const handSpeed = Math.min(1, Math.sqrt(Math.max(10, this.hands[i].z)) / 30);
			this.hands[i].z -= handSpeed;
			if (i % 3 === 0 && Math.abs(this.hands[i].z - dok.pos[2]) < 5) {
				this.hands[i].x += (dok.pos[0] - this.hands[i].x) / 15;
			}
			if (this.hands[i].z < 10 || dok.pos[2] - this.hands[i].z > 20) {
				this.hands[i].z += 100 + 150 * Math.random();
				this.hands[i].x = (Math.random() - .5) * 30;
			}

			if (!this.kicked) {
				const dx = this.hands[i].x - dok.pos[0];
				const dy = -dok.heightAboveGround;
				const dz = this.hands[i].z - dok.pos[2];
				const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
				this.hands[i].dist = dist;

				if (dist < .5) {
					const { dok } = this.sceneData;
					this.kicked = this.now;
					dok.mov.x = 0;//x > dok.pos[0] ? -1 : 1;
					dok.mov.z = 0;
					dok.mov.y = 3;
					console.log("HAND", dist, handSpeed, dx, dy, dz);				
				}
			}
		}

		for (let i = 0; i < this.mouths.length; i++) {
			this.mouths[i].z -= .1;
			this.mouths[i].y = -1 + Math.cos(this.mouths[i].z / 2);
			this.mouths[i].x = Math.sin(this.mouths[i].z / 10) * 20;
			// if (i % 3 === 0 && Math.abs(this.mouths[i].z - dok.pos[2]) < 5) {
			// 	this.mouths[i].x += (dok.pos[0] - this.mouths[i].x) / 20;
			// }
			if (!this.kicked) {
				const dx = this.mouths[i].x - dok.pos[0];
				const dy = this.mouths[i].y - (dok.pos[1] + dok.heightAboveGround);
				const dz = this.mouths[i].z - dok.pos[2];
				const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
				this.mouths[i].dist = dist;

				if (dist < 2) {
					const { dok } = this.sceneData;
					this.kicked = this.now;
					dok.mov.x = 0;//x > dok.pos[0] ? -1 : 1;
					dok.mov.z = 0;
					dok.mov.y = 3;
					console.log("MOUTH", dist);				
				}
			}


			if (this.mouths[i].z < 150 || dok.pos[2] - this.mouths[i].z > 20) {
				this.mouths[i].z += 100 + 200 * Math.random();
			}
		}

		//	camera follow
		MotionUtils.follow(sceneData.cam, dok.pos[0] + dx * 4, dok.pos[1] + dok.heightAboveGround / 2, dok.pos[2] + dz * 4, .05, 0);
		this.score = Math.max(dok.pos[2] / 10, this.score);
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
						return [this.levels[i], instanceIndex];
					}
				}
			}
		}
		return [this.levels[this.levels.length - 1], 0];
	}

	getHeight(px, py, pz) {
		const [platform] = this.getPlatform(px, py, pz);
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
		room: "sgib",
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
		range: [1, 500],
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
			spriteSize: [266, 311],
			grid: [15, 11],
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
			src: "eye-decor",
			grid: [10, 10],
		},
		{
			id: "entrance-floor",
			src: "eye-decor",
			grid: [5, 5],
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
			src: "hand",
			spriteSize: [306,338],
			grid: [6, 1],
			padding: 1,
			frameRate: 10,
			animations: [
				["openclose","open,close"],
				["open", "0-9"],
				["close", "9,8,7,6,5,4,3,2,1,0"],
			],
		},
		{
			src: "mouth",
			spriteSize: [280,240],
			grid: [1, 2],
			padding: 1,
			frameRate: 5,
			animations: [
				["chump", "0-1"],
			],
		},
		{
			id: "eye-decor",
			src: "eye-decor",
			// spriteSize: [214,214],
			// grid: [8,3],
			// frameRate: 10,
			// animations: [
			// 	["rotate", "0-20"],
			// ],
		},
	],
	ui: [
		{
			id: "controlBox",
			tag: "div",
			style: {
				margin: "8px",
				backgroundColor: "#333333",
				display: "flex",
				flexDirection: "column",
			},
		},
		{
			id: "score",
			tag: "div",
			style: {
				textAlign: "center",
				margin: "4px",
				fontSize: "8pt",
				backgroundColor: "#000000",
			},
			parent: "controlBox",
			innerText: ({game}) => `HIGH: ${game.highScore.toFixed(2)}\nSCORE: ${game.score.toFixed(2)}`,
		},

	],
	sprites: [
		...makePlatform("bed"),
		{	//	upper level
			platformId: "upper-level",
			id: ({definition}) => definition.platformId.get(),
			src: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].top,
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
			platformId: "upper-level",
			src: ({game: { levelMap }, definition: {id, platformId}}) => levelMap[platformId.get()].side,
			type: SpriteType.Back,
			cols: 40, rows: 2,
			radius: 8,
			center: [
				({game, definition}) => game.getDefinition(definition.platformId.get()).pos[0].get(),
				-2.65,
				({game, definition}) => game.getDefinition(definition.platformId.get()).pos[2].get(),
			],
			scale: [ 1.3, 1 ],
			tintColor: 0x88995555,
			brightness: 110,
			fixed: true,
		}),
		ShapeUtils.cylinder({
			platformId: "upper-level",
			src: ({game: { levelMap }, definition: {id, platformId}}) => levelMap[platformId.get()].side,
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
		SpriteUtils.makeSprite({
			src: "dok",
			data: {
				currentDok: ({game}, index) => game.socket.getSharedDataAt(index),
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
			id: "hand",
			src: "hand",
			position: [
				({game}, index) => game.hands[index].x,
				({game}, index) => game.hands[index].y,
				({game}, index) => game.hands[index].z,
			],
			scale: [
				({game}) => game.levelMap["hand"].scale[0] / 2,
				({game}) => game.levelMap["hand"].scale[1] / 2,
			],
			spriteHue: ({game}, index) => {
				const ddist = game.hands[Math.floor(index/2)].dist ? game.hands[Math.floor(index/2)].dist : 3;
				return (ddist < 3 ? (3 - ddist) / 3 : 0) + (index % 6 === 0 ? .5 : 0);
			},
			spriteTint: 0x88995555,
			shadowColor: 0xFF333333,
//			spriteBrightness: 200,//({game}, index) => game.hands[Math.floor(index/2)].dist ? Math.max(110, 200 - game.hands[Math.floor(index/2)].dist * 10) : 110,
//			fixed: ({game}) => game.levelMap["hand"].fixed,
			spriteCount: ({game}) => game.hands.length,
		}),
		{
			src: "mouth",
			pos: [
				({game}, index) => game.mouths[index].x,
				({game}, index) => game.mouths[index].y,
				({game}, index) => game.mouths[index].z,
			],
			scale: [
				2,
				2,
			],
			effects: {
				tintColor: 0x88995555,
				brightness: ({game}, index) => game.mouths[index].dist ? Math.max(110, 200 - game.mouths[index].dist * 10) : 110,
			},
			count: ({game}) => game.mouths.length,
		},
		// SpriteUtils.makeSprite({
		// 	id: "tree",
		// 	src: "tree",
		// 	position: [
		// 		({game}, index) => game.levelMap["tree"].elems[index].position[0],
		// 		({game}, index) => game.levelMap["tree"].elems[index].position[1],
		// 		({game}, index) => game.levelMap["tree"].elems[index].position[2],
		// 	],
		// 	scale: [
		// 		({game}) => game.levelMap["tree"].scale[0],
		// 		({game}) => game.levelMap["tree"].scale[1],
		// 	],
		// 	shadowColor: 0xFF333333,
		// 	fixed: ({game}) => game.levelMap["tree"].fixed,
		// 	spriteCount: ({game}) => game.levelMap["tree"].elems.length,
		// }),
		// SpriteUtils.makeSprite({
		// 	id: "smorf",
		// 	src: "smorf",
		// 	position: [
		// 		({game}, index) => game.levelMap["smorf"].elems[index].position[0],
		// 		({game}, index) => game.levelMap["smorf"].elems[index].position[1],
		// 		({game}, index) => game.levelMap["smorf"].elems[index].position[2],
		// 	],
		// 	scale: [
		// 		({game}) => game.levelMap["smorf"].scale[0],
		// 		({game}) => game.levelMap["smorf"].scale[1],
		// 	],
		// 	shadowColor: 0xFF333333,
		// 	fixed: ({game}) => game.levelMap["smorf"].fixed,
		// 	spriteCount: ({game}) => game.levelMap["smorf"].elems.length,
		// }),

		{
			id: "entrance",
			src: "entrance-floor",
			type: SpriteType.Floor,
			pos: [
				0,
				-3.155,
				({game: { levelMap }, definition: {id}}, index) => 5 + 20 * index,
			],
			scale: [6, 6],
			effects: {
				brightness: ({game}) => game.getDefinition("lower-level").effects.brightness.get(),
				hue: ({game}) => game.getDefinition("lower-level").effects.hue.get(),
			},
			count: 100,
			fixed: true,			
		},

		{	//	floor
			id: "lower-level",
			src: "eye-decor",
			size: ({game: { levelMap }, definition: {id}}) => levelMap[id.get()].size,
			type: SpriteType.Floor,
			circleRadius: 1,
			pos: [
				0,
				-3.15,
				({game: { levelMap }, definition: {id}}, index) => 15 + levelMap[id.get()].size * index,
			],
			scale: [
				({definition}) => definition.size.get(),
				({definition}) => -definition.size.get(),
			],
			effects: {
				brightness: 50,
				hue: 1.1,
			},
			count: 100,
			fixed: true,
		},
	],
});