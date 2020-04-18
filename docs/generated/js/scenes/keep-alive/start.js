SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			position: [ 0, 0 ],
			cam: [ 0, 0 ],
			waterPos: [ 0, 0 ],
			map: {},
			cells: [],
			tile: null,
		};
	}

	getCell(x, y) {
		const { map, cells } = this.sceneData;
		let cell = map[`${x}|${y}`];
		if (!cell) {
			cell = map[`${x}|${y}`] = {
				x, y, index: cells.length,
				active: 0,
			};
			cells.push(cell);
		}
		return cell;
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
	}

	setCellLevel(x, y, raise) {
		const cell = this.getCell(x, y);
		if (raise && cell.active <= 0 || !raise && cell.active > 0) {
			cell.active = raise ? this.now : -this.now;
		}
	}

}}, {
	firstScene: true,
	settings: {
		background: 0xaacc88,
		docBackground: 0xFFFFFF,
		curvature: .5,
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
		diffusionStrength: 0.5
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
			grid: [26, 26],
			padding: 15,
		},
		{
			src: "selector",
			grid: [2, 3],
			frameRate: 10,
			animations: [
				["blink", "0-3"],
				["lower", "3"],
				["raise", "1"],
				["lower-side", "5"],
				["raise-side", "4"],
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
	],
	keyboard: {
		onActionPress: ({game}) => {
			const [ x, y ] = game.sceneData.position;
			const shouldRaise = game.getCell(x, y).active <= 0;
			game.setCellLevel(x, y, shouldRaise);
			game.sceneData.mode = shouldRaise ? "RAISE" : "LOWER";
		},
		onActionRelease: ({game}) => {
			game.sceneData.mode = null;
		},
		onDownPress: ({game: {sceneData}}) => {
			const dx = Math.sin(sceneData.turnGoal);
			const dz = Math.cos(sceneData.turnGoal);
			game.sceneData.position[0] -= dx;
			game.sceneData.position[1] += dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			if (game.sceneData.mode) {
				const [ x, y ] = game.sceneData.position;
				game.setCellLevel(x, y, game.sceneData.mode === "RAISE");
			}
		},
		onUpPress: ({game: {sceneData}}) => {
			const dx = Math.sin(sceneData.turnGoal);
			const dz = Math.cos(sceneData.turnGoal);
			game.sceneData.position[0] += dx;
			game.sceneData.position[1] -= dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			if (game.sceneData.mode) {
				const [ x, y ] = game.sceneData.position;
				game.setCellLevel(x, y, game.sceneData.mode === "RAISE");
			}
		},
		onLeftPress: ({game: {sceneData}}) => {
			const dx = Math.cos(sceneData.turnGoal);
			const dz = Math.sin(sceneData.turnGoal);
			game.sceneData.position[0] -= dx;
			game.sceneData.position[1] -= dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			if (game.sceneData.mode) {
				const [ x, y ] = game.sceneData.position;
				game.setCellLevel(x, y, game.sceneData.mode === "RAISE");
			}
		},
		onRightPress: ({game: {sceneData}}) => {
			const dx = Math.cos(sceneData.turnGoal);
			const dz = Math.sin(sceneData.turnGoal);
			game.sceneData.position[0] += dx;
			game.sceneData.position[1] += dz;
			game.sceneData.position[0] = Math.round(game.sceneData.position[0]);
			game.sceneData.position[1] = Math.round(game.sceneData.position[1]);
			if (game.sceneData.mode) {
				const [ x, y ] = game.sceneData.position;
				game.setCellLevel(x, y, game.sceneData.mode === "RAISE");
			}
		},
	},
	sprites: [
		{
			init: ({game, definition}) => {
				game.ui = game.engine.canvas.parentElement.appendChild(document.createElement("div"));
				game.ui.style.position = "absolute";
				game.ui.style.display = "none";
				setTimeout(() => {
					game.ui.style.top = `${game.engine.canvas.offsetTop}px`;
					game.ui.style.left = `${game.engine.canvas.offsetLeft}px`;
					game.ui.style.display = "";
				}, 200);

				window.addEventListener("resize", () => {
					game.ui.style.top = `${game.engine.canvas.offsetTop}px`;
					game.ui.style.left = `${game.engine.canvas.offsetLeft}px`;
				});

				const titleBox = game.ui.appendChild(document.createElement("div"));
				titleBox.style.width = game.engine.canvas.style.width;
				titleBox.style.height = "80px";
				titleBox.style.backgroundColor = "#cccccc";

				const toolbox = game.ui.appendChild(document.createElement("canvas"));		
				toolbox.width = 50;
				toolbox.height = 400;
				toolbox.style.backgroundColor = "#778899";
				toolbox.style.margin = "8px";
				definition.toolbox = toolbox;
				definition.grounds = [
					"grass-ground",
					"dirt-ground",
					"sand-ground",
					"water-mix",
				];
			},
			refresh: ({game, definition}) => {
				const { engine: { glRenderer }, sceneData } = game;
				if (glRenderer.loaded) {
					const { toolbox } = definition;

					definition.grounds.forEach((src, index) => {
						glRenderer.drawToCanvas2d(src, 5, 5 + 48 * index, 40, toolbox);
					});

					const tile = sceneData.tile || definition.grounds[0];
					const index = definition.grounds.indexOf(tile);
					const context = toolbox.getContext("2d");
					context.lineStyle = "#FF0000";
					context.lineWidth = "2";
					context.rect(5, 5 + 48 * index, 40, 40);
				}
			},
			refreshRate: 10,
		},	
		ShapeUtils.cube({
			topSrc: "grass-ground",
			sideSrc: "dirt-ground",
			hidden: ({game: { sceneData, now }}, index) => {
				const { active } = sceneData.cells[index];
				return active < 0 && (now + active) > 1000;
			},
			position: [
				({game}, index) => game.sceneData.cells[index].x * 4,
				({game: { sceneData, now }}, index) => {
					const { active } = sceneData.cells[index];
					const preState = active > 0 ? -5.0 : 0.0, 
						postState = active > 0 ? 0.0 : -5.0;
					const progress = Math.sqrt(Math.min(1, (now - Math.abs(active)) / 200));
					return progress * postState + (1 - progress) * preState;
				},
				({game}, index) => game.sceneData.cells[index].y * 4,
			],
			scale: [4.1, 4.1],
			cubeCount: ({game}) => game.sceneData.cells.length,
		}),
		ShapeUtils.cube({
			topSrc: "selector",
			sideSrc: "selector",
			position: [
				({game}) => game.sceneData.position[0] * 4,
				0,
				({game}) => game.sceneData.position[1] * 4,
			],
			topAnimation: ({game: { sceneData }}) => {
				return !sceneData.mode ? "blink" : sceneData.mode === "RAISE" ? "raise" : "lower";
			},
			sideAnimation: ({game: { sceneData }}) => {
				return !sceneData.mode ? "blink" : sceneData.mode === "RAISE" ? "raise-side" : "lower-side";
			},
			scale: [4.101, 4.101],
		}),
		{
			src: "grass-ground",
			type: SpriteType.Floor,
			scale: [4, 4],
			brightness: 70,
			size: 50,
			animation: ({game, definition}, index) => {
				const px = game.sceneData.position[0], py = game.sceneData.position[1];
				return px % definition.size.get() + py * definition.size.get() + index + 10000;
			},
			pos: [
				({game, definition}, index) => (game.sceneData.position[0] + index % definition.size.get() - definition.size.get() / 2) * definition.scale[0].get(),
				-2,
				({game, definition}, index) => (game.sceneData.position[1] + Math.floor(index / definition.size.get()) - definition.size.get() / 2) * definition.scale[1].get(),
			],
			count: 50 * 50,
		},
	],
});