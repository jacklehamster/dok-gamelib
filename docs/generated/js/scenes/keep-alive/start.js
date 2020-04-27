SceneManager.add({Game: class extends Game {
	beepBoxLinks() {
		return [
			"https://beepbox.co/#8n31sbk0l00e0ft2wm0a7g0fj07i0r1o3210T5v2L4ua0q3d7f7y4z1C0c4h0HTP9Bx99sp99900T0v3L4ue2q3d5f7y3z8C0w5c2h2T3v2L4uaeq1d2f8y2z9C0Sp99f9c9Vppbaa9gT4v1L4uf0q1z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00b4x8Qlzhm4x8i4zgQd3g0000h028Q8w0i4h4h4h4h000p23jFH-861GIIdv8QMdNvntlKKEEwV6ELOs30R7jXWqaaGWy_nhh15Z4xkmqfGidd7MhUiOhV17Bb4ughVsAughY8m0zO2f9AzO2f1BOf88YCif88-vV7D4uggAuihU3h7AAuh97AAvd8if98Yyif0if88Of98YXyfd8MFKfWwkSLwYCT8RSQSqWkTjYxjhy1704rd6i4pqqcEzA2fajcI0",
			"https://beepbox.co/#8n31sbk0l00e0ft3Mm0a7g0fj07i0r1o3210T1v1L4u61q1d5f7y0z6C1c0A5F2B6V7Q0530Pf636E0011T1v1L4u72q1d1f9y0z8C1c0A1FhB8V8Q4154Pd567E0111T1v1L4ua8q3d4f7y1z1C0c1AbFhB2V2Q2ae1Pa514E0001T4v1L4uf0q1z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00b000h4iczhh404g0h02c04h4h4h4z8Qkh4h4h4h4h4h4p24WFE-OeGwzEE8Wiei8U0zw2ePh_b4tcAtcAtcAtcAqqf1J8WqOfA-hOaN7j97j97j97ydp7jihYOyeCieCieCieCifew2eCIzVUp7nh7j97j97j97BQAtd96aq_Jd7EOmjASVej8QQVSHbwsHaGOIGGCGAzV68O6jAkVehjjjqhWXaieyCAzEFF8UaKAzQiejAkVehjjjjjihyPhYI97j97h97h9BFEZ8zw2e08XdvZNvj9vj9v1WnV5sLBli-Ci-Ci_nqq_psGIHaHaMFTaV_UNVlpmlmlx0NVgIQoxxBT86mCzbAaifbIzOic0",
		];
	}

	constructor() {
		super();
		this.tiles = [
			"grass-ground",
			"dirt-ground",
			"sand-ground",
			"blue-ground",
			"water-mix",
		];
		this.emptyCell = {};
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			position: [ 0, 0 ],
			cam: [ 0, 0 ],
			waterPos: [ 0, 0 ],
			map: {},
			cells: [],
			tile: this.tiles[0],
			bears: [
				{
					bear: [0, 0],
					bearDirection: 0,
					bearAI: {},
					tint: 0x00000000,
					size: 1,
					speed: .04,
					type: "bear",
				},
			],
			slimes: [],
			apple: 0,
			banana: 0,
			score: 0,
			goodies: [],
			bonuses: [],
		};

		this.achievements = [
			{
				banana: 10,
			},
			{
				apple: 5,
				banana: 10,
			},
			{
				apple: 10,
				banana: 20,
			},
			{
				apple: 30,
				banana: 50,
			},
			{
				apple: 50,
				banana: 75,
			},
			{
				apple: 100,
				banana: 100,
			},
		];


		const initialTiles = `
			....L1^0L1....
			..L1.2.2.2L1..
			L1.2.2.2.2.2L1
			^0.2.2.2.2.2^0
			L1.2.2.2.2.2L1
			..L1.2.2.2L1..
			....L1^0L1....
		`;
		initialTiles.split("\n").filter(a => a.length).forEach((line, index) => {
			const y = index - 3;
			const l = (line.trim().match(/.{1,2}/g)||[]).forEach((letters, index) => {
				const x = index - 3;
				const [feature, type] = letters;
				if (!isNaN(type)) {
					const cell = this.getCell(x, y, true);
					cell.active = 1;
					cell.tile = this.tiles[parseInt(type)];
				}
				if (feature === '^') {
					const cell = this.getCell(x, y, true);
					cell.raised = 1;
				}
				if (feature === "L") {
					const cell = this.getCell(x, y, true);
					cell.raised = 1;
					cell.locked = true;
				}
			});
		});

		this.availableBears = [
			{
				bear: [20, 0],
				bearDirection: 0,
				bearAI: {},
				tint: 0x55aa0000,
				size: .8,
				speed: .05,
				needRescue: true,
				type: "bear",
			},
			{
				bear: [20, 0],
				bearDirection: 0,
				bearAI: {},
				tint: 0x770000cc,
				size: 1.2,
				speed: .07,
				needRescue: true,
				type: "bear",
			},
			{
				bear: [20, 0],
				bearDirection: 0,
				bearAI: {},
				tint: 0x77FFFFFF,
				size: 1.1,
				speed: .1,
				needRescue: true,
				type: "bear",
			},
			{
				bear: [20, 0],
				bearDirection: 0,
				bearAI: {},
				tint: 0x7700FF00,
				size: 1.5,
				speed: .1,
				needRescue: true,
				type: "bear",
			},
		];
	}

	get level() {
		return this.sceneData.bears.length;
	}

	getAchievement() {
		return this.achievements[Math.max(0, Math.min(this.level - 1, this.achievements.length - 1))];
	}

	checkAchievement(force) {
		const achievement = this.getAchievement();
		if (!force && this.sceneData.banana < achievement.banana) {
			return;
		}
		if (!force && this.sceneData.apple < achievement.apple) {
			return;
		}
		this.sceneData.banana = 0;
		this.sceneData.apple = 0;
		this.sceneData.goodies.forEach(({x, y}) => {
			this.getCell(x, y).item = null;
		});

		this.sceneData.goodies.length = 0;
		const bear = this.availableBears.shift() || {
			bear: [20, 0],
			bearDirection: 0,
			bearAI: {},
			tint: 0x55000000 & Math.floor(0x1000000 * Math.random()),
			size: .5 + Math.random(),
			speed: .02 + Math.random() * .1,
			needRescue: true,
		};
		bear.type = "bear";
		this.sceneData.bears.push(bear);
		this.sceneData.lastLevelUp = this.now;

		if (this.sceneData.bears.length === 2) {
			this.unlockMedal("Second Bear");
		}

		if (this.sceneData.bears.length === 3) {
			this.unlockMedal("Third Bear");
		}


		this.updateInfoBox();
	}

	updateInfoBox() {
		const str = [];
		const achievement = this.getAchievement();
		str.push(`🐻${this.sceneData.bears.length}`);
		if (this.level) {
			str.push(`🍌${this.sceneData.banana}/${achievement.banana}`);
			if (this.level > 1) {
				str.push(`🍎${this.sceneData.apple}/${achievement.apple}`);
			}
		}
		str.push(`🔢${this.sceneData.score}`);

		document.getElementById("infoBox").innerText = str.join("\n");
	}

	rotateTile() {
		const index = Math.max(this.tiles.indexOf(this.sceneData.tile), 0);
		this.sceneData.tile = this.tiles[(index + 1) % this.tiles.length];
	}

	getEmptyCell(x,y) {
		this.emptyCell.x = x;
		this.emptyCell.y = y;
		this.emptyCell.raised = 0;
		this.emptyCell.active = false;
		this.emptyCell.tile = null;
		this.emptyCell.locked = false;
		this.emptyCell.person = null;
		this.emptyCell.item = null;
		return this.emptyCell;
	}

	getCell(x, y, forUpdate) {
		x = Math.round(x);
		y = Math.round(y);
		const { map, cells } = this.sceneData;
		let cell = map[`${x}|${y}`];
		if (!cell) {
			const cellSelected = this.sceneData.position[0] === x && this.sceneData.position[1] === y;
			if (!cellSelected && !forUpdate) {
				return this.getEmptyCell(x, y);
			}

			cell = map[`${x}|${y}`] = {
				x, y, index: cells.length,
				raised: 0,
				active: cellSelected && this.sceneData.mode ? this.now : 0,
				tile: cellSelected && this.sceneData.tile,
				locked: false,
				person: null,
				item: null,

				getHeight: (now) => {
					const { raised, active } = cell;
					const preState = (raised > 0 ? -3.0 : 0.0);
					const postState = (raised > 0 ? 0.0 : -3.0) + (active <= 0 ? -10 : 0);
					const progress = Math.sqrt(Math.min(1, (now - Math.abs(raised)) / 200));
					return progress * postState + (1 - progress) * preState;
				},
			};
			cells.push(cell);
		}
		return cell;
	}

	canGo(fromCell, toCell, type) {
		if (fromCell === toCell) {
			return true;
		}

		if (fromCell.raised <= 0 && toCell.raised > 0) {
			return false;
		}

		if (type === "slime" && toCell.active <= 0) {
			return false;
		}

		if (toCell.active > 0 && type) {
			if (type === 'item' && toCell.item) {
				return false;
			}
			if (type === 'person' && toCell.person) {
				return false;
			}
		}

		return true;
	}

	loop() {
		const { sceneData, keys } = this;

		//	turn camera
		let dTurn = 0;
		if (keys.controls.turnLeft > 0) {
			dTurn --;
		}
		if (keys.controls.turnRight > 0) {
			dTurn ++;
		}
		const turnSpeed = .1;
		const turnStep = Math.PI / 2;
		if (dTurn) {
			sceneData.turn += dTurn * turnSpeed;
			sceneData.turnGoal = Math.floor(sceneData.turn / turnStep) * turnStep + (dTurn > 0 ? turnStep : 0);
		} else {
			const turnDiff = sceneData.turnGoal - sceneData.turn;
			if (Math.abs(turnDiff) >= 0.01) {
				sceneData.turn += turnDiff / 5;
			} else {
				sceneData.turn = sceneData.turnGoal = sceneData.turnGoal % (Math.PI * 2);
			}
		}
		//	camera follow
		sceneData.cam[0] += (sceneData.position[0] - sceneData.cam[0]) / 20;
		sceneData.cam[1] += (sceneData.position[1] - sceneData.cam[1]) / 20;			

		//	check gameOver
		if (!this.sceneData.gameOver) {
			if (this.sceneData.bears.every(({bearAI}) => bearAI.KO)) {
				this.sceneData.gameOver = this.now;
				this.sendScore(this.sceneData.score);
			}
		}

		this.cleanup();
	}

	cleanup() {
		for (let i = this.sceneData.cells.length - 1; i >= 0; i--) {
			const cell = this.sceneData.cells[i];
			if (cell.active < 0 && this.now + cell.active > 2000) {
				const lastCell = this.sceneData.cells[this.sceneData.cells.length - 1];
				lastCell.index = i;
				delete this.sceneData.map[`${cell.x}|${cell.y}`];
				this.sceneData.cells[i] = lastCell;
				this.sceneData.cells.pop();
			}
		}
		let bearGone = 0;
		for (let i = this.sceneData.bears.length - 1; i >= 0; i--) {
			const { bearAI } = this.sceneData.bears[i];
			if (bearAI.KO && this.now - bearAI.KO > 2000) {
				const lastBearData = this.sceneData.bears[this.sceneData.bears.length - 1];
				this.sceneData.bears[i] = lastBearData;
				this.sceneData.bears.pop();
				bearGone++;
			}
		}
		if (bearGone) {
			this.checkAchievement();
			this.updateInfoBox();
		}
	}

	deactivate(x, y) {
		const cell = this.getCell(x, y, true);
		if (!cell.locked) {
			cell.active = -game.now;
		}
	}

	setCellLevel(x, y, raise) {
		const cell = this.getCell(x, y, true);
		if (cell.locked) {
			return;
		}
		if (raise && cell.raised <= 0 || !raise && cell.raised > 0) {
			cell.raised = raise ? this.now : -this.now;
		}
		if (this.tiles.indexOf(this.sceneData.tile) >= 0) {
			cell.tile = this.sceneData.tile;
		}
		cell.active = true;
	}

	onMove(x, y) {
		if (this.sceneData.mode === "WATER") {
			this.deactivate(x, y);
		} else if (this.sceneData.mode) {
			this.setCellLevel(x, y, this.sceneData.mode === "RAISE");
		}
	}
}}, {
	settings: {
		background: 0xaacc88,
		docBackground: 0xFFFFFF,
		music: {
			src: ({game}) => game.sceneData.muted ? null : "guita",
			volume: .5,
		},
	},
	light: {
		pos: [
			0,
			100,
			0,
		],
		ambient: .7,
		shininess: 1,
		specularStrength: 0.1,
		diffusionStrength: 0.5,
		curvature: .5,
	},
	view: {
		pos: [
			({game}) => game.sceneData.cam[0] * 4,
			0,
			({game}) => game.sceneData.cam[1] * 4,
		],
		cameraDistance: 50,
		tilt: .8,
		turn: ({game}) => game.sceneData.turn,
		range: [1, 200],
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			src: "water-mix",
			grid: [17, 17],
			padding: 10,
		},
		{
			src: "selector",
			grid: [3, 3],
			frameRate: 10,
			animations: [
				["blink", "0-3"],
				["lower", "3"],
				["raise", "1"],
				["lower-side", "5"],
				["raise-side", "4"],
				["lock", "6"],
				["red", "0"],
			],
		},
		{
			src: "sand-ground",
			padding: 5,
		},
		{
			src: "dirt-ground",
			padding: 5,
		},
		{
			src: "blue-ground",
			padding: 5,
		},
		{
			src: "grass-ground",
			padding: 5,
		},
		{
			src: "bear",
			grid: [8, 4],
			padding: 5,
			spriteSize: [114, 137],
			frameRate: 10,
			animations: [
				["idle", "0*20,12*3"],
				["walk","0-3"],
				["pickup","4"],
				["eat","pickup*3,5*3,chew*20"],
				["chew","6-7"],
				["hurt","8"],
				["hot","9-10"],
				["KO","11"],
				["idle-down-left", "13"],
				["walk-down-left","13-16"],
				["idle-left", "17"],
				["walk-left","17-20"],
				["idle-up-left", "21"],
				["walk-up-left","21-24"],
				["idle-up", "25"],
				["walk-up","25-28"],
				["drown","29"],
				["eat-wrong","pickup*3,5*3,chew*3,hot*10"],
			],
		},
		{
			src: "fruits",
			grid: [5,2],
			padding: 6,
			spriteSize: [86, 107],		
			animations: [
				["apple", "0"],
				["banana", "1"],
				["virus", "2"],
				["spike", "3"],
				["treasure", "4"],
				["bonzai", "5"],
				["jewelry", "6"],
				["statue", "7"],
				["painting", "8"],
				["sandwich", "9"],
			],
		},
		{
			src: "slime",
			grid: [6,3],
			padding: 8,
			spriteSize: [82, 82],		
			frameRate: 20,
			animations: [
				["idle", "0,1,1,2,2,2,2,1,1,1,0,0,0,0"],
				["jump", "3-14"],
			],
		},
		{
			src: "treasure",
			spriteSize: [171, 186],
			padding: 5,
			grid: [5, 2],
			animation: [
				["treasure", "0"],
				["bonzai", "1"],
				["jewelry", "2"],
				["statue", "3"],
				["painting", "4"],
				["sandwich", "5"],
			],
		},
		TextUtils.makeSpriteData("primary-font"),
	],
	keyboard: {
		onKeyPress: ({game}, key) => {
			if (game.sceneData.bears.every(({bearAI}) => bearAI.KO)) {
				return;
			}
			if (key === "Tab") {
				game.rotateTile();
			}
		},
		onActionPress: ({game}) => {
			if (game.sceneData.bears.every(({bearAI}) => bearAI.KO)) {
				return;
			}
			const [ x, y ] = game.sceneData.position;
			if (game.sceneData.tile === "water-mix") {
				game.deactivate(x, y);
				game.sceneData.mode = "WATER";
			} else {
				const cell = game.getCell(x, y, true);
				const shouldRaise = cell.raised <= 0;
				game.setCellLevel(x, y, shouldRaise);
				game.sceneData.mode = shouldRaise ? "RAISE" : "LOWER";
			}
		},
		onActionRelease: ({game}) => {
			if (game.sceneData.bears.every(({bearAI}) => bearAI.KO)) {
				if (game.sceneData.bears.every(({bearAI}) => game.now - bearAI.KO > 3000)) {
					game.gotoScene("keep-alive-intro");
					return;
				}
			}
			game.sceneData.mode = null;
		},
		onDownPress: ({game: {sceneData}}) => {
			const dx = Math.sin(sceneData.turnGoal);
			const dz = Math.cos(sceneData.turnGoal);
			game.sceneData.position[0] -= dx;
			game.sceneData.position[1] += dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			const [ x, y ] = game.sceneData.position;
			game.onMove(x, y);
		},
		onUpPress: ({game: {sceneData}}) => {
			const dx = Math.sin(sceneData.turnGoal);
			const dz = Math.cos(sceneData.turnGoal);
			game.sceneData.position[0] += dx;
			game.sceneData.position[1] -= dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			const [ x, y ] = game.sceneData.position;
			game.onMove(x, y);
		},
		onLeftPress: ({game: {sceneData}}) => {
			const dx = Math.cos(sceneData.turnGoal);
			const dz = Math.sin(sceneData.turnGoal);
			game.sceneData.position[0] -= dx;
			game.sceneData.position[1] -= dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			const [ x, y ] = game.sceneData.position;
			game.onMove(x, y);
		},
		onRightPress: ({game: {sceneData}}) => {
			const dx = Math.cos(sceneData.turnGoal);
			const dz = Math.sin(sceneData.turnGoal);
			game.sceneData.position[0] += dx;
			game.sceneData.position[1] += dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			const [ x, y ] = game.sceneData.position;
			game.onMove(x, y);
		},
	},
	sprites: [
// 		TextUtils.makeSprite({
// 			text: ({game}, index) => {
// 				return game.sceneData.bonuses.length ? `+${game.sceneData.bonuses[0].score}` : "";
// 			},
// 			fontId: "primary-font",
// 			tintColor: 0xFFFFFF00,
// 			faceUser: true,
// 			letterDistance: 2.1,
// 			position: [
// 				({game}, index) => game.sceneData.bonuses[0].x,
// 				({game}) => 2,
// 				({game}, index) => game.sceneData.bonuses[0].y,
// 			],
// //			count: ({game}) => game.sceneData.bonuses.length,
// 		}),

		TextUtils.makeSprite({
			text: "Game Over",
			fontId: "primary-font",
			tintColor: 0xFFcc0000,
			scale: [5, 5],
			letterDistance: 5.2,
			faceUser: true,
			hidden: ({game}) => !game.sceneData.bears.every(({bearAI}) => bearAI.KO),
			position: [
				({game}) => game.view.pos[0].get() - 4,
				({game}) => game.view.pos[1].get() + 10,
				({game}) => game.view.pos[2].get() - 2,
			],
		}),
		TextUtils.makeSprite({
			text: "Press [space] to continue",
			fontId: "primary-font",
			tintColor: 0xFF332222,
			scale: [2, 2],
			letterDistance: 2.1,
			faceUser: true,
			hidden: ({game}) => !game.sceneData.bears.every(({bearAI}) => bearAI.KO || game.now - bearAI.KO < 3000),
			position: [
				({game}) => game.view.pos[0].get() - 5,
				({game}) => game.view.pos[1].get() + 5,
				({game}) => game.view.pos[2].get() - 2,
			],
		}),
		TextUtils.makeSprite({
			text: "Press [space] to continue",
			fontId: "primary-font",
			tintColor: 0xFFFFFFFF,
			brightness: 150,
			scale: [2, 2],
			letterDistance: 2.1,
			faceUser: true,
			hidden: ({game}) => !game.sceneData.bears.every(({bearAI}) => bearAI.KO || game.now - bearAI.KO < 3000),
			position: [
				({game}) => game.view.pos[0].get() - 5.1,
				({game}) => game.view.pos[1].get() + 5.1,
				({game}) => game.view.pos[2].get() - 2.1,
			],
		}),
		{
			init: ({game, definition}) => {
				const { canvas } = game.engine;
				game.ui = canvas.parentElement.appendChild(document.createElement("div"));
				game.ui.style.position = "absolute";
				game.ui.style.display = "none";
				game.ui.classList.add("unselectable");
				game.ui.style.top = `${canvas.offsetTop}px`;
				game.ui.style.left = `${canvas.offsetLeft}px`;
				game.ui.style.display = "flex";

				window.addEventListener("resize", () => {
					game.ui.style.top = `${canvas.offsetTop}px`;
					game.ui.style.left = `${canvas.offsetLeft}px`;
				});

				const controlBox = game.ui.appendChild(document.createElement("div"));
				controlBox.id = "controlBox";
				controlBox.style.margin = "8px";
				controlBox.style.backgroundColor = "#cccccc";
				controlBox.style.display = "flex";
				controlBox.style.flexDirection = "column";

				const help = controlBox.appendChild(document.createElement("div"));
				help.style.textAlign = "center";
				help.style.margin = "4px";
				help.style.fontSize = "8pt";
				help.style.color = "#666666";
				help.innerText = "[TAB]\nswitch";

				game.controlBox = controlBox;

				game.ui.appendChild(document.createElement("div")).style.width = "640px";

				const infoBox = game.ui.appendChild(document.createElement("div"));
				infoBox.id = "infoBox";
				infoBox.style.margin = "8px";
				infoBox.style.color = "black";
				infoBox.style.fontSize = "10pt";
				infoBox.style.fontFamily = "Courier New";
				infoBox.innerText = ``;
				game.updateInfoBox();

				const toolbox = controlBox.appendChild(document.createElement("canvas"));		
				toolbox.width = 50;
				toolbox.height = 280;
				definition.toolbox = toolbox;
				definition.grounds = [
					"grass-ground",
					"dirt-ground",
					"sand-ground",
					"blue-ground",
					"water-mix",
				];
				definition.strokes = [
					"#FF0000",
					"#FFFFFF",
					"#000000",
				];


				const instruct = controlBox.appendChild(document.createElement("div"));
				instruct.style.textAlign = "center";
				instruct.style.margin = "4px";
				instruct.style.fontSize = "8pt";
				instruct.style.color = "#666666";
				instruct.innerText = "[SPACE]\nRAISE/\nLOWER\n\n[A,S,D,W]\nMove\n\n[Q,E]\nRotate";




				const soundControl = controlBox.appendChild(document.createElement("button"));
				soundControl.id = "soundControl";
				soundControl.innerText = '🔉';
				soundControl.style.padding = "4px";
				soundControl.style.margin = "4px";
				soundControl.style.borderRadius = "50%";
				soundControl.style.backgroundColor = "#eeeeee";
				soundControl.style.cursor = "pointer";
				soundControl.addEventListener("mousedown", e => {
					definition.setMute.run(!game.sceneData.muted);
				});
				definition.setMute.run(localStorage.getItem("mute") === "mute");
			},
			setMute: ({game}, value) => {
				game.sceneData.muted = value;
				const soundControl = document.getElementById("soundControl");
				soundControl.innerText = game.sceneData.muted ? '🔇' : '🔉';
				localStorage.setItem("mute", value?"mute":"");
			},
			destroy: ({game}) => {
				game.ui.parentElement.removeChild(game.ui);
 			},
			refresh: ({game, definition}) => {
				if (game.sceneData.bears.every(({bearAI}) => bearAI.KO)) {
					if (game.ui.style.dipslay !== "none") {
						game.controlBox.style.display = "none";
					}
					return;
				}

				const { engine: { glRenderer: { spritesheetManager }, canvasRenderer }, sceneData } = game;
				if (spritesheetManager.loaded) {
					const { toolbox } = definition;
					const context = toolbox.getContext("2d");
					context.clearRect(0, 0, toolbox.width, toolbox.height);

					definition.grounds.forEach((src, index) => {
						canvasRenderer.drawToCanvas(src, 5, 5 + 48 * index, 40, toolbox);
					});

					const tile = sceneData.tile || definition.grounds[0];
					const idx = definition.grounds.indexOf(tile);
					if (!sceneData.mode) {
						const context = toolbox.getContext("2d");
						context.beginPath();
						context.strokeStyle = definition.strokes[Math.floor(game.now / 100) % definition.strokes.length];
						context.lineWidth = "2";
						context.rect(5, 5 + 48 * idx, 40, 40);
						context.stroke();
					} else if (sceneData.mode === "RAISE") {
						canvasRenderer.drawToCanvas("selector", 5, 4 + 48 * idx, 40, toolbox, 4);
					} else if (sceneData.mode === "LOWER") {
						canvasRenderer.drawToCanvas("selector", 5, 4 + 48 * idx, 40, toolbox, 5);						
					}
				}
			},
			refreshRate: 20,
		},
		{
			src: "fruits",
			pos: [
				({game: {sceneData}}, index) => game.sceneData.goodies[index].x * 4,
				({game: {sceneData, now}}, index) => {
					const goodie = game.sceneData.goodies[index];
					const { x, y } = goodie;
					const cell = game.getCell(x, y);
					return cell.active <= 0 ? -1.5 + Math.sin(now / 200) * .2 : 3 + cell.getHeight(game.now);
				},
				({game: {sceneData}}, index) => game.sceneData.goodies[index].y * 4,
			],
			scale: [4, 4],
			count: ({game}) => game.sceneData.goodies.length,
			animation: ({game}, index) => game.sceneData.goodies[index].type,
			init: ({game, definition}) => {
			},
			randomFruit: ({game, definition}) => {
				const level = game.level;
				const bananaChance = 100;
				const appleChance = level > 2 ? 30 : level > 1 ? 20 : 0;
				const virusChance = level > 2 ? 10 : 0;
				const spikeChance = level > 5 ? 10 : level > 3 ? 5 : 0;

				if (definition.level !== level) {
					definition.level = level;

					const bag = [];
					bag.push(...new Array(bananaChance).fill("banana"));
					bag.push(...new Array(appleChance).fill("apple"));
					bag.push(...new Array(virusChance).fill("virus"));
					bag.push(...new Array(spikeChance).fill("spike"));
					if (level > 2) {
						bag.push("treasure");
						bag.push("bonzai");
						bag.push("jewelry");
						bag.push("statue");
						bag.push("painting");
						bag.push("sandwich");
					}
					definition.bag = bag;
				}
				return definition.bag[Math.floor(Math.random() * definition.bag.length)];
			},
			refresh: ({game, definition}) => {
				const { sceneData: { goodies, bears, slimes }, now } = game;

				const slimeGoal = game.level < 4 ? 0 : game.level < 5 ? 3 : game.level + 4;
				if (slimes.length < slimeGoal) {
					const [bearX, bearY] = bears[Math.floor(Math.random() * bears.length)].bear;

					slimes.push({
						x: bearX + 10 + Math.random() * 25,
						y: bearY + (Math.random()-.5) * 12,
						dy: 0,
					});					
				}

				const goodiesGoal = Math.min(5 + 3 * Math.pow(2, bears.length), 300);
				if (goodies.length < goodiesGoal) {
					const [bearX, bearY] = bears[Math.floor(Math.random() * bears.length)].bear;

					goodies.push({
						x: bearX + 10 + Math.random() * 25,
						y: bearY + (Math.random()-.5) * 12,
						dx: 0,
						dy: 0,
						type: definition.randomFruit.get(),
					});
				}
				const floatSpeed = .02;
				goodies.forEach(goodie => {
					const { x, y } = goodie;
					if (goodie.eaten) {
						goodie.eaten = 0;
						goodie.x = game.sceneData.position[0] + 10 + Math.random() * 20;
						goodie.y = game.sceneData.position[1] + 10 * (Math.random() - .5);
						goodie.type = definition.randomFruit.get();
						return;
					}

					const cell = game.getCell(x, y);
					if (cell.active <= 0) {
						if (game.canGo(cell, game.getCell(x - .5, y), 'item')) {
							goodie.x -= floatSpeed;
							goodie.dy = 0;
							if (goodie.x < game.sceneData.position[0] + -10) {
								goodie.x = game.sceneData.position[0] + 10 + Math.random() * 20;
								goodie.y = game.sceneData.position[1] + 10 * (Math.random() - .5);
								goodie.type = definition.randomFruit.get();
							}
						} else {
							if (!goodie.dy) {
								goodie.dy = Math.random() - .5;
							} else if (game.canGo(cell, game.getCell(x, y + goodie.dy), 'item')) {
								goodie.y += goodie.dy / 10;
							} else {
								goodie.dy = 0;
							}
						}
						const newCell = game.getCell(goodie.x, goodie.y);
						if (newCell.active > 0) {
							if (cell !== newCell) {
								const fromCell = game.getCell(goodie.x, goodie.y);
								fromCell.item = null;
								newCell.item = goodie;
							}
						}
					} else if (!cell.item) {
						cell.item = goodie;
					}
				});

				slimes.forEach(slime => {
					const { x, y } = slime;

					const cell = game.getCell(x, y);
					if (cell.active <= 0) {
						if (game.canGo(cell, game.getCell(x - .5, y), 'person')) {
							slime.x -= floatSpeed;
							slime.dy = 0;
							if (slime.x < game.sceneData.position[0] + -10) {
								slime.x = game.sceneData.position[0] + 10 + Math.random() * 20;
								slime.y = game.sceneData.position[1] + 10 * (Math.random() - .5);
							}
						} else {
							if (!slime.dy) {
								slime.dy = Math.random() - .5;
							} else if (game.canGo(cell, game.getCell(x, y + slime.dy), 'person')) {
								slime.y += slime.dy / 10;
							} else {
								slime.dy = 0;
							}
						}
						const newCell = game.getCell(slime.x, slime.y);
						if (newCell) {
							if (cell !== newCell) {
								const fromCell = game.getCell(slime.x, slime.y);
								fromCell.person = null;
								newCell.person = slime;
							}
						}
					} else if (!cell.person) {
						cell.person = slime;
					} else if (slime.dx || slime.dy) {
						const goalCell = game.getCell(slime.x + Math.sign(slime.dx) * .1, slime.y + Math.sign(slime.dy) * .1);
						if (game.canGo(cell, goalCell, "slime")) {
							slime.x += slime.dx * .03;
							slime.y += slime.dy * .03;
						} else {
							slime.dx = 0;
							slime.dy = 0;
						}
						if (goalCell.person && goalCell.person.type === "bear") {
							if (goalCell.person.bearAI.action !== "resting" && goalCell.person.bearAI.action !== "hurt") {
								goalCell.person.bearAI.action = "hurt";
								goalCell.person.bearAI.waitUntil = now + 3000;
							}
						}

						const newCell = game.getCell(slime.x, slime.y);
						if (newCell) {
							if (cell !== newCell && newCell.active > 0) {
								cell.person = null;
								newCell.person = slime;
							}
						}
					}

					if (!slime.dx && !slime.dy || Math.random() < .05) {
						if (Math.random() < .5) {
							slime.dx = 0;
							slime.dy = Math.random() < .5 ? -1 : 1;
						} else {
							slime.dx = Math.random() < .5 ? -1 : 1;
							slime.dy = 0;
						}
					}
				});


			},
		},
		SpriteUtils.makeSprite({
			src: "slime",
			position: [
				({game}, index) => game.sceneData.slimes[index].x * 4,
				({game: {sceneData, now}}, index) => {
					const slime = game.sceneData.slimes[index];
					const { x, y } = slime;
					const cell = game.getCell(x, y);
					return cell.active <= 0 ? -1.5 + Math.sin(now / 200) * .2 : 3 + cell.getHeight(game.now);
				},
				({game}, index) => game.sceneData.slimes[index].y * 4,
			],
			scale: [4, 4],
			shadowColor: 0xFF333333,
			spriteSize: [82, 82],
			animation: ({game}, index) => {
				const cell = game.getCell(game.sceneData.slimes[index].x, game.sceneData.slimes[index].y);
				if (cell.active <= 0) {
					return "idle";
				}
				return "jump";
			},
			spriteCount: ({game}) => game.sceneData.slimes.length,
		}),
		SpriteUtils.makeSprite({
			src: "bear",
			spriteCount: ({game}) => game.sceneData.bears.length,
			spriteTint: ({game}, index) => game.sceneData.bears[index].tint,
			position: [
				({game}, index) => game.sceneData.bears[index].bear[0] * 4,
				({game}, index) => {
					const cell = game.getCell(game.sceneData.bears[index].bear[0], game.sceneData.bears[index].bear[1]);
					return (cell.active > 0 ? cell.getHeight(game.now) : -6 + Math.sin(game.now / 100) * .2) + 4;
				},
				({game}, index) => game.sceneData.bears[index].bear[1] * 4,				
			],
			scale: [
				({game, definition}, index) => {
					const angleCycle = Math.PI * 2;
					const rotation = game.sceneData.bears[index].bearDirection - game.view.turn.get();
					const dir = Math.round(((rotation % angleCycle + angleCycle) % angleCycle) * 8 / angleCycle) % 8;
					return definition.walkAnim[dir][1] * 6;
				},
				({game, definition}, index) => {
					return (game.sceneData.bears[index].size || 1) * 6;
				},
			],
			shadowColor: 0xFF333333,
			spriteSize: [114, 136],
			animation: ({game, definition}, index) => {
				const cell = game.getCell(game.sceneData.bears[index].bear[0], game.sceneData.bears[index].bear[1]);
				if (cell.active <= 0) {
					return "drown";
				}
				const { bearAI, bearDirection } = game.sceneData.bears[index];
				const angleCycle = Math.PI * 2;
				const rotation = bearDirection - game.view.turn.get();
				const dir = Math.round(((rotation % angleCycle + angleCycle) % angleCycle) * 8 / angleCycle) % 8;
				
				if (bearAI.action === "sick") {
					return "eat-wrong";
				}

				if (bearAI.action === "eating") {
					return "eat";
				}

				if (bearAI.action === "resting") {
					return "KO";
				}

				if (bearAI.action === "hurt") {
					return "hurt";
				}

				return bearAI.action === "walk" || bearAI.action === "center" ? definition.walkAnim[dir][0] : definition.idleAnim[dir][0];
			},
			hidden: ({game}, index) => {
				if (game.sceneData.bears[index].bearAI.KO) {
					return true;
				}
				return false;
			},
			init: ({game, definition}) => {
				definition.idleAnim = [
					["idle", 1],
					["idle-down-left", 1],
					["idle-left", 1],
					["idle-up-left", 1],
					["idle-up", 1],
					["idle-up-left", -1],
					["idle-left", -1],
					["idle-downleft", -1],
				];

				definition.walkAnim = [
					["walk", 1],
					["walk-down-left", 1],
					["walk-left", 1],
					["walk-up-left", 1],
					["walk-up", 1],
					["walk-up-left", -1],
					["walk-left", -1],
					["walk-downleft", -1],
				];

				definition.directions = ['S','N','E','W'];

				definition.updateDirection = (bearData, bearAI) => {
					switch(bearAI.direction) {
						case 'S':
							bearData.bearDirection = 0;
							break;
						case 'N':
							bearData.bearDirection = Math.PI;
							break;
						case 'E':
							bearData.bearDirection = -Math.PI/2;
							break;
						case 'W':
							bearData.bearDirection = Math.PI/2;
							break;
					}
				};

				definition.directionToGoal = (game, bearAI) => {
					let goalX = 0;
					let goalY = 0;
					switch(bearAI.direction) {
						case 'S':
							goalY ++;
							break;
						case 'N':
							goalY --;
							break;
						case 'E':
							goalX ++;
							break;
						case 'W':
							goalX --;
							break;
					}
					return [goalX, goalY];
				};


				definition.lookForDirection = (game, index) => {
					const { sceneData } = game;
					const directions = definition.directions;
					const { bear, bearAI } = sceneData.bears[index];

					const [ x, y ] = bear;
					const cell = game.getCell(x + 4 * (Math.random()-.5), y + 4 * (Math.random()-.5));
					if (cell.item === "apple" || cell.item === "banana") {
						const dx = cell.x - x;
						const dy = cell.y - y;

						bearAI.foundTarget = game.now;
						if (Math.abs(dx) > Math.abs(dy)) {
							return dx < 0 ? 'W' : 'E';
						} else {
							return dy < 0 ? 'N' : 'S';
						}
					}

					return directions[Math.floor(Math.random() * directions.length)];
				};
			},
			refresh: ({game, definition}) => {
				const { sceneData, now } = game;

				const floatSpeed = .02;
				sceneData.bears.forEach((bearData, index) => {
					const {bearAI, bear, bearDirection, speed, needRescue} = bearData;
					if (needRescue) {
						const [ x, y ] = bear;
						const cell = game.getCell(x, y);
						if (cell.active > 0) {
							bearData.needRescue = 0;
							bearData.waitUntil = now + 5000;
							return;
						}
						if (game.canGo(cell, game.getCell(x - .5, y))) {
							bear[0] -= floatSpeed;
							bearData.dy = 0;
							if (x < game.sceneData.position[0] + -10) {
								bear[0] = game.sceneData.position[0] + 10 + Math.random() * 20;
								bear[1] = game.sceneData.position[1] + 10 * (Math.random() - .5);
							}
						} else {
							if (!bearData.dy) {
								bearData.dy = Math.random() - .5;
							} else if (game.canGo(cell, game.getCell(x, y + bearData.dy))) {
								bear[1] += bearData.dy / 10;
							} else {
								bearData.dy = 0;
							}
						}
						return;
					}

					if (!bearAI.lastUpdate || now - bearAI.lastUpdate > 500) {
						//	Process bear AI
						bearAI.lastUpdate = now;

						if (bearAI.KO) {
							return;
						}

						const fromCell = game.getCell(bear[0], bear[1]);

						if (bearAI.startDrowning) {
							if (now - bearAI.startDrowning > 15000) {
								if (fromCell.active > 0) {
									bearAI.startDrowning = 0;
								} else {
									bearAI.KO = now;
								}
							}
							return;
						}

						if (!bearAI.initialized) {
							bearAI.waitUntil = now + 2000;
							bearAI.action = "idle";
							bearAI.initialized = true;
						} else if (bearAI.waitUntil > now) {
						} else if (bearAI.action === "resting") {
							if (bearAI.wakeup < now) {
								bearAI.action = "idle";
							}
						} else if (bearAI.action === "hurt") {
							if (bearAI.lastBadStuff && now - bearAI.lastBadStuff < 30000) {
								bearAI.KO = now;
							} else {
								bearAI.action = "resting";
								bearAI.wakeup = now + 15000;
								bearAI.lastBadStuff = now;
							}
						} else if (bearAI.action === "sick") {
							if (bearAI.lastBadStuff && now - bearAI.lastBadStuff < 30000) {
								bearAI.KO = now;
							} else {
								bearAI.action = "resting";
								bearAI.wakeup = now + 15000;
								bearAI.lastBadStuff = now;
							}
						} else if (bearAI.action === "eating") {
							bearAI.action = "idle";
						} else if (bearAI.action === "idle") {
							const [ goalX, goalY ] = definition.directionToGoal(game, bearAI);

							//	check if can walk
							const toCell = game.getCell(bear[0] + goalX, bear[1] + goalY);

							if ((goalX || goalY) && game.canGo(fromCell, toCell, 'person')) {
								bearAI.action = "walk";
							} else {
								//	look at random direction
								bearAI.direction = definition.lookForDirection(game, index);
								bearAI.waitUntil = now + 50;
							}
						} else if (bearAI.action === "walk") {
							if (bearAI.didChangeCell) {
								bearAI.didChangeCell = false;
								//	give option to change direction
								if (Math.random() < .5 && (!bearAI.foundTarget || now - bearAI.foundTarget > 3000)) {
									bearAI.direction = definition.lookForDirection(game, index);
								}
							}
						} else if (bearAI.action === "center") {
							//	give option to change direction
							if (Math.random() < .5 && (!bearAI.foundTarget || now - bearAI.foundTarget > 3000)) {
								bearAI.direction = definition.lookForDirection(game, index);
							}
						}
					}

					//	Process bear Action
					definition.updateDirection(bearData, bearAI);

					if (bearAI.action === "center") {
						const cell = game.getCell(bear[0], bear[1]);

						const dx = (cell.x - bear[0]) / 10;					
						const dy = (cell.y - bear[1]) / 10;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < .001) {
							bear[0] = cell.x;
							bear[1] = cell.y;
							bearAI.action = "idle";
						} else {
							bear[0] += dx / dist * Math.min(speed, dist);
							bear[1] += dy / dist * Math.min(speed, dist);
						}
					} else if (bearAI.action === "walk") {
						const [ goalX, goalY ] = definition.directionToGoal(game, bearAI);
						const fromCell = game.getCell(bear[0], bear[1]);
						const toCell = game.getCell(bear[0] + goalX, bear[1] + goalY);

						if (game.canGo(fromCell, toCell, 'person')) {

							if (bearAI.previousCell === toCell) {
								bearAI.action = "idle";
								if (now - bearAI.lastBore > 5000) {
									bearAI.previousCell = null;
								}
								return;
							}

							bear[0] += goalX * speed * (fromCell.active <= 0 ? 2 : 1);
							bear[1] += goalY * speed * (fromCell.active <= 0 ? 2 : 1);
							if (!goalX) {
								const dx = (Math.round(bear[0]) - bear[0]) / 10;					
								bear[0] += dx / 10;
								if (Math.abs(dx) < .001) {
									bear[0] = Math.round(bear[0]);
								}
							}
							if (!goalY) {
								const dy = (Math.round(bear[1]) - bear[1]) / 10;					
								bear[1] += dy / 10;
								if (Math.abs(dy) < .001) {
									bear[1] = Math.round(bear[1]);
								}
							}

							const newCell = game.getCell(bear[0], bear[1]);
							if (fromCell !== newCell) {
								fromCell.person = null;
								newCell.person = bearData;

								bearAI.didChangeCell = true;
								if (newCell.active <= 0) {
									if (!bearAI.startDrowning) {
										bearAI.startDrowning = now;
									}
								} else if (newCell.item) {
									let eatable = true;
									if (newCell.item.type === "banana") {
										game.sceneData.banana ++;
										game.sceneData.score += 5;
									} else if (newCell.item.type === "apple") {
										game.sceneData.apple ++;
										game.sceneData.score += 20;
									} else if (newCell.item.type === "virus" || newCell.item.type === "spike") {
										eatable = false;
									} else {
										switch(newCell.item.type) {
											case "treasure":
												game.sceneData.score += 300;
												break;
											case "bonzai":
												game.sceneData.score += 500;
												break;
											case "jewelry":
												game.sceneData.score += 750;
												break;
											case "statue":
												game.sceneData.score += 1000;
												break;
											case "painting":
												game.sceneData.score += 1500;
												break;
											case "sandwich":
												game.sceneData.score += 2000;
												break;
										}
									}
									newCell.item.eaten = now;
									newCell.item = null;
									bearAI.action = eatable ? "eating" : "sick";
									bearAI.waitUntil = now + 3000;
									game.checkAchievement();
									game.updateInfoBox();
								}

								bearAI.previousCell = fromCell;
								bearAI.lastBore = now;
							}
						} else {
							bearAI.action = "center";
						}
					}
				});
			},
		}),

		ShapeUtils.cube({
			topSrc: ({game: {sceneData}}, index) => sceneData.cells[index] ? sceneData.cells[index].tile : "grass-ground",
			sideSrc: "dirt-ground",
			position: [
				({game}, index) => game.sceneData.cells[index].x * 4,
				({game: { sceneData, now }}, index) => {
					return sceneData.cells[index].getHeight(now);
				},
				({game}, index) => game.sceneData.cells[index].y * 4,
			],
			scale: [4.1, 4.1],
			cubeCount: ({game}) => game.sceneData.cells.length,
			hidden: ({game: { sceneData, now }}, index) => {
				const { active } = sceneData.cells[index];
				return active <= 0 && now + active > 1000;
			},
		}),
		ShapeUtils.cube({
			topSrc: "selector",
			sideSrc: "selector",
			topAnimation: "lock",
			sideAnimation: "lock",
			position: [
				({game}, index) => game.sceneData.cells[index].x * 4,
				({game: { sceneData, now }}, index) => {
					return sceneData.cells[index].getHeight(now);
				},
				({game}, index) => game.sceneData.cells[index].y * 4,
			],
			scale: [4.11, 4.11],
			cubeCount: ({game}) => game.sceneData.cells.length,
			hidden: ({game: { sceneData, now }}, index) => {
				const { active, locked } = sceneData.cells[index];
				return !locked || active <= 0 && now + active > 1000;
			},
		}),


		ShapeUtils.cube({
			topSrc: "selector",
			sideSrc: "selector",
			position: [
				({game}) => game.sceneData.position[0] * 4,
				({game}) => {
					const cell = game.getCell(game.sceneData.position[0], game.sceneData.position[1]);
					return cell.active > 0 ? cell.getHeight(game.now) : -3;
				},
				({game}) => game.sceneData.position[1] * 4,
			],
			topAnimation: ({game: { sceneData }}) => {
				const cell = game.getCell(game.sceneData.position[0], game.sceneData.position[1]);
				if (cell.locked) {
					return "red";
				}
				return !sceneData.mode ? "blink" : sceneData.mode === "RAISE" ? "raise" : "lower";
			},
			sideAnimation: ({game: { sceneData }}) => {
				const cell = game.getCell(game.sceneData.position[0], game.sceneData.position[1]);
				if (cell.locked) {
					return "red";
				}
				return !sceneData.mode ? "blink" : sceneData.mode === "RAISE" ? "raise-side" : "lower-side";
			},
			scale: [4.12, 4.12],
		}),
		{
			src: "water-mix",
			type: SpriteType.Water,
			scale: [4, 4],
			effects: {
				tintColor: 0x88ccaa,
				brightness: 70,
			},
			size: 50,
			animation: ({game, definition}, index) => {
				const px = game.sceneData.position[0], py = game.sceneData.position[1];
				return px % definition.size.get() + py * definition.size.get() + index + 10000;
			},
			pos: [
				({game, definition}, index) => game.sceneData.position[0] * 4 + (index % definition.size.get() - definition.size.get() / 2) * definition.scale[0].get(),
				-2,
				({game, definition}, index) => game.sceneData.position[1] * 4 + (Math.floor(index / definition.size.get()) - definition.size.get() / 2) * definition.scale[1].get(),
			],
			count: 50 * 50,
		},
	],
});