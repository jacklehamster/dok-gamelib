const GROUND_ICE = 1;
const GROUND_WATER = 2;

SceneManager.add({
	Game: class extends Game {
		constructor() {
			super();
			this.seed = Math.random();

			const sceneData = this.sceneData = {};
			sceneData.cam = [0, 0, 0];
			sceneData.camShift = [0, 0, 0];
			sceneData.turn = 0;
			sceneData.cells = [];
			sceneData.cellMap = {};

			sceneData.mapSize = 22;

			sceneData.viewTop = 1;
			sceneData.viewZoom = 0;

			this.resetMap(0, 0);
		}

		getCorner(x0, x1, z0, z1) {
			const types = [
				this.calcGroundedType(x0, z0),
				this.calcGroundedType(x0, z1),
				this.calcGroundedType(x1, z0),
				this.calcGroundedType(x1, z1),
			];
			if (types.some(type => type === GROUND_ICE)) {
				return 0;
			}
			return (this.makeRandom(x0,x1,z0,z1) % 10) / 20;
		}

		resetMap(x, z) {
			const { sceneData, now } = this;
			const { cellMap, cells } = sceneData;
			const mm = {};
			for (let zz = 0; zz < sceneData.mapSize; zz++) {
				for (let xx = 0; xx < sceneData.mapSize; xx++) {
					const xxx = xx-Math.floor(sceneData.mapSize/2) + x;
					const zzz = zz-Math.floor(sceneData.mapSize/2) + z;
					const tag = `${xxx}_${zzz}`;
					if (!cellMap[tag]) {
						const type = this.calcGroundedType(xxx, zzz);
						const cell = {
							x: xxx, z: zzz,
							index: cells.length,
							corners: [
								this.getCorner(xxx-1,xxx,zzz-1,zzz),
								this.getCorner(xxx-1,xxx,zzz,zzz+1),
								this.getCorner(xxx,xxx+1,zzz,zzz+1),
								this.getCorner(xxx,xxx+1,zzz-1,zzz),
							],
							type,
							grounded: type < 8,
						};
						cell.height = Math.max(0, (cell.corners[0] + cell.corners[1] + cell.corners[2] + cell.corners[3]) / 4);
						cellMap[tag] = cell;
						cells.push(cell);
					}
					mm[tag] = true;
				}
			}

			for (let tag in cellMap) {
				if (!mm[tag]) {
					const cell = cellMap[tag];
					const lastCell = cells[cells.length - 1];
					cells.pop();
					lastCell.index = cell.index;
					cells[lastCell.index] = lastCell;
					delete cellMap[tag];
				}
			}
		}

		makeRandom(...values) {
			let val = 0;
			for (let i = 0; i < values.length; i++) {
				val += (1 + Math.sin(this.seed + (13 + i) * values[i])) * 100000;
			}
			return Math.abs(val);
		}

		calcGroundedType(xPos, zPos) {
			const value = Math.abs(Math.sin(xPos * .1 + zPos * .3));
			const value2 = Math.abs(Math.cos(zPos * .1 + xPos * .3));
			return Math.abs((Math.floor(this.seed + value * 100000) % 11 ^ Math.floor(this.seed + value2 * 10000) % 7 !== 1)) % 13;
		}

		isGrounded(xPos, zPos) {
			const tag = `${xPos}_${zPos}`;
			const { sceneData } = this;
			const { cellMap } = sceneData;
			return cellMap[tag] ? cellMap[tag].grounded : false;
		}

		getCell(xPos, zPos) {
			xPos = Math.floor(xPos);
			zPos = Math.floor(zPos);
			const tag = `${xPos}_${zPos}`;
			const { sceneData } = this;
			const { cellMap } = sceneData;
			return cellMap[tag];
		}

		canMove(dx, dz) {
			const { sceneData } = this;
			const { cam } = sceneData;
			const tileSize = 3;
			const xDest = Math.round((cam[0] + dx) / tileSize);
			const zDest = Math.round((cam[2] + dz) / tileSize);
			return this.isGrounded(xDest, zDest);
		}

		onChangeCell(posX, posZ) {
			const { sceneData } = this;
			this.resetMap(posX, posZ);
		}
	},
}, {
	settings: {
		thumbnail: "penguin",
		background: 0xE8E5E3,
		curvature: 2,
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
	keyboard: {
		onKeyPress: ({game}, code) => {
			const { sceneData } = game;
			switch(code) {
				case "KeyV":
					if (sceneData.viewTop < sceneData.viewZoom) {
						sceneData.viewTop = game.now;
					} else {
						sceneData.viewZoom = game.now;
					}
					break;
				default:
					break;
			}
		},
	},
	view: {
		pos: [
			({game}) => game.sceneData.cam[0] + game.sceneData.camShift[0],
			({game}) => game.sceneData.cam[1] + game.sceneData.camShift[1],
			({game}) => game.sceneData.cam[2] + game.sceneData.camShift[2],
		],
		viewAngle: 45,
		turn: ({game}) => game.sceneData.turn,
		tilt: ({game}) => {
			const { sceneData, now } = game;
			const progress = Math.min(1, (now - Math.max(sceneData.viewTop, sceneData.viewZoom)) / 300);
			const titlFrom = sceneData.viewTop > sceneData.viewZoom ? .4 : .7;
			const tiltGoal = sceneData.viewTop > sceneData.viewZoom ? .7 : .4;
			return progress * tiltGoal + (1 - progress) * titlFrom;
		},
		cameraDistance: ({game}) => {
			const { sceneData, now } = game;
			const progress = Math.min(1, (now - Math.max(sceneData.viewTop, sceneData.viewZoom)) / 300);
			const distFrom = sceneData.viewTop > sceneData.viewZoom ? 5 : 15;
			const distGoal = sceneData.viewTop > sceneData.viewZoom ? 15 : 5;
			return progress * distGoal + (1 - progress) * distFrom;
		},
		range: [0, 60]
	},
	refresh: ({game}) => {
		const { sceneData, keys } = game;

		let moving = false;
		const tileSize = 3;
		const speed = .2;
		const cellX = Math.round(sceneData.cam[0]/tileSize), cellZ = Math.round(sceneData.cam[2]/tileSize);

		if (!sceneData.gameOver) {
			if (keys.controls.up <= 0 || keys.controls.down <= 0) {
				if (keys.controls.up > 0) {
					sceneData.moving = 1;
					moving = true;
				}
				if (keys.controls.down > 0) {
					sceneData.moving = -1;
					moving = true;
				}
			}
			let dx = Math.sin(sceneData.turn||0) * (sceneData.moving||0) * speed;
			let dz = -Math.cos(sceneData.turn||0) * (sceneData.moving||0) * speed;
			let xGoal = Math.round(Math.round((sceneData.cam[0] + dx) / tileSize) * tileSize);
			let zGoal = Math.round(Math.round((sceneData.cam[2] + dz) / tileSize) * tileSize);


			if ((Math.abs(dx) > .01 || Math.abs(dz) > .01) && !game.canMove(dx, dz)) {
				dx = 0; dz = 0;
				sceneData.moving = 0;
				moving = false;
				xGoal = Math.round(Math.round(sceneData.cam[0] / tileSize) * tileSize);
				zGoal = Math.round(Math.round(sceneData.cam[2] / tileSize) * tileSize);
			}

			if (moving) {
				if (Math.abs(dx) > .01) {
					sceneData.cam[0] += dx;
				} else {
					sceneData.cam[0] += (xGoal - sceneData.cam[0]) / 5;
				}
				if (Math.abs(dz) > .01) {
					sceneData.cam[2] += dz;
				} else {
					sceneData.cam[2] += (zGoal - sceneData.cam[2]) / 5;
				}
			} else {
				if (Math.abs(sceneData.cam[0]-xGoal) > speed) {
					if (Math.abs(dx) > .01) {
						sceneData.cam[0] += dx;
					} else {
						sceneData.cam[0] += (xGoal - sceneData.cam[0]) / 5;
					}
				} else {
					sceneData.cam[0] = xGoal;
				}
				if (Math.abs(sceneData.cam[2]-zGoal) > speed) {
					if (Math.abs(dz) > .01) {
						sceneData.cam[2] += dz;
					} else {
						sceneData.cam[2] += (zGoal - sceneData.cam[2]) / 5;
					}
				} else {
					sceneData.cam[2] = zGoal;
				}
				if (sceneData.cam[0] === xGoal && sceneData.cam[2] === zGoal) {
					sceneData.moving = 0;
				}
			}
		}

		let turning = false;
		if (keys.controls.left <= 0 || keys.controls.right <= 0) {
			if (keys.controls.left > 0) {
				sceneData.turnDirection = -1;
				turning = true;
			}
			if (keys.controls.right > 0) {
				sceneData.turnDirection = 1;
				turning = true;
			}
		}

		if (sceneData.turnDirection) {
			const turnSpeed = .12;
			if (turning) {
				sceneData.turn += sceneData.turnDirection * turnSpeed;
			} else {
				const turnStep = Math.PI/2;
				const turnGoal = turnStep * (Math.floor(sceneData.turn / turnStep) + (sceneData.turnDirection > 0 ? 1 : 0));
				let dTurn = (turnGoal - sceneData.turn);
				if (Math.abs(dTurn) > turnSpeed) {
					sceneData.turn += sceneData.turnDirection * turnSpeed;	
				} else {
					sceneData.turn = turnGoal;
					sceneData.turnDirection = 0;
				}
			}
		}

		if (!sceneData.gameOver) {
			const newCellX = Math.round(sceneData.cam[0]/tileSize), newCellZ = Math.round(sceneData.cam[2]/tileSize);
			if (newCellX !== cellX || newCellZ !== cellZ) {
				game.onChangeCell(newCellX, newCellZ);
			}
		}
	},
	sprites: [
		{
			src: "primary-font",
			tintColor: 0xFF00ccFF,
			scale: [.2, .2],
			text: "Penguin",
			refresh: ({definition}) => {
				const text = definition.text.get();
				if (definition.cachedText !== text) {
					definition.cachedText = text;
					definition.positions = [0];
					for (let i = 0; i < text.length; i++) {
						const { width } = definition.getLetterInfo(text[i], definition.src.get());
						definition.positions[i + 1] = definition.positions[i] + width;
					}
				}
			},
			pos: [
				({game, definition}, index) => {
					const angle = game.view.turn.get();
					const dx = Math.cos(angle);
					return game.sceneData.cam[0] + dx * .2 * (definition.positions[index] - .5);
				},
				-.1,
				({game, definition}, index) => {
					const angle = game.view.turn.get();
					const dz = Math.sin(angle);
					return game.sceneData.cam[2] + dz * .2 * (definition.positions[index] - .5);
				}
			],
			animation: {
				frame: ({definition}, index) => {
					const letterInfo = definition.getLetterInfo(definition.text.get().charAt(index), definition.src.get());
					return letterInfo.index;
				},
				range: ({definition}) => definition.characters.get().length,
				frameRate: 0,
			},
			characters: ({game, definition}) => game.getFont(definition.src.get()).characters,
			grid: [
				({definition}) => Math.ceil(Math.sqrt(definition.characters.get().length)),
				({definition}) => Math.ceil(definition.characters.get().length / definition.grid[0].get()),
			],
			count: ({definition}) => definition.text.get().length,			
		},
		{
			src: "penguin",
			brightness: 150,
			init: ({game}) => {
				const penguinFrames = [
					{ orientation: 'E', startFrame: 8, flip: true, },
					{ orientation: 'NE', startFrame: 12, flip: true, },
					{ orientation: 'N', startFrame: 16, flip: false, },
					{ orientation: 'NW', startFrame: 12, flip: false, },
					{ orientation: 'W', startFrame: 8, flip: false, },
					{ orientation: 'SW', startFrame: 4, flip: false, },
					{ orientation: 'S', startFrame: 0, flip: false, },
					{ orientation: 'SE', startFrame: 4, flip: true, },
				];

				game.sceneData.penguin = {
					pos: [game.sceneData.cam[0], -1.3, game.sceneData.cam[2]],
					moving: false,
					mov: [0, 0, .1],
					penguinFrames,
				};
			},
			angledFrame: ({game, definition}) => {
				const { penguinFrames } = game.sceneData.penguin;
				const index = Math.round(definition.angle.get() / 45) % penguinFrames.length;
				return penguinFrames[index];
			},
			angle: ({game}) => {
				const [ dx, , dz ] = game.sceneData.penguin.mov;
				return ((game.view.turn.get() - Math.atan2(dz, dx)) / Math.PI * 180 % 360 + 360) % 360;
			},
			refresh: ({game, definition}) => {
				const { cam, penguin, camShift, viewZoom, viewTop } = game.sceneData;
				const { pos } = penguin;
				const dx = cam[0] - pos[0];
				const dz = cam[2] - pos[2];
				const dist = Math.sqrt(dx * dx + dz * dz);
				if (dist > .2) {
					const speed = .2;
					pos[0] += (dx / dist) * speed;
					pos[2] += (dz / dist) * speed;
					penguin.moving = true;
					penguin.mov[0] = dx;
					penguin.mov[2] = dz;
				} else if (penguin.moving) {
					penguin.moving = false;
				}

				const cell = game.getCell(pos[0], pos[2]);
				if (!cell) {
					penguin.pos[1] +=  (-1.3 - penguin.pos[1]) / 5;
				} else {
					penguin.pos[1] += (cell.height -1.3 - penguin.pos[1]) / 5;
				}

				const angledFrame = definition.angledFrame.get();
				const movValue = viewZoom < viewTop 
					? (angledFrame.orientation.indexOf('S')>=0 ? 10 : 5)
					: (angledFrame.orientation.indexOf('S')>=0
						? 6
						: angledFrame.orientation.indexOf('N')>=0
						? 0
						: 3
					);
				const camShiftGoalX = penguin.mov[0] * movValue;
				const camShiftGoalY = penguin.mov[2] * movValue;
				camShift[0] += (camShiftGoalX - camShift[0]) / 5;
				camShift[2] += (camShiftGoalY - camShift[2]) / 5;
			},
			grid: [4, 5],
			pos: [
				({game}) => game.sceneData.penguin.pos[0],
				({game}) => game.sceneData.penguin.pos[1],
				({game}) => game.sceneData.penguin.pos[2],
			],
			animation: {
				start: ({game, definition}) => definition.angledFrame.get().startFrame,
				range: 4,
				frameRate: ({game}) => game.sceneData.penguin.moving ? 10 : 0,
			},
			hotspot: [0, -.6],
			scale: [
				({game, definition},index) => definition.angledFrame.get().flip ? -1 : 1,
				({game}) => {
					const { sceneData } = game;
					if (sceneData.viewTop > sceneData.viewZoom) {
						return .8;
					} else {
						return .9;
					}
				}
			],
		},
		{	//	ground
			src: ({game, definition}, index) => {
				const { type } = definition.cell.get(index);
				if (type === GROUND_WATER) {
					return "water";
				}
				return "artic";
			},
			tintColor: ({definition}, index) => definition.cell.get(index).type === GROUND_ICE ? 0x6600ccFF : 0,
			brightness: ({definition}, index) => definition.cell.get(index).type === GROUND_ICE ? 80 : 70,
			padding: 1,
			cell: ({game, definition},index) => game.sceneData.cells[index],
			grounded: ({game, definition},index) => {
				return definition.cell.get(index).grounded;
			},
			corners: [
				({game, definition},index) => !definition.grounded.get(index) ? 0 : game.sceneData.cells[index].corners[0],
				({game, definition},index) => !definition.grounded.get(index) ? 0 : game.sceneData.cells[index].corners[1],
				({game, definition},index) => !definition.grounded.get(index) ? 0 : game.sceneData.cells[index].corners[2],
				({game, definition},index) => !definition.grounded.get(index) ? 0 : game.sceneData.cells[index].corners[3],
			],
			type: ({definition}, index) => {
				const { type } = definition.cell.get(index);
				if (type === GROUND_WATER) {
					return SpriteType.Water;
				}
				return SpriteType.Floor;
			},
			xPos: ({game, definition},index) => definition.cell.get(index).x,
			zPos: ({game, definition},index) => definition.cell.get(index).z,
			pos: [
				({game, definition},index) => definition.xPos.get(index) * 3,
				({game, definition},index) => definition.grounded.get(index) ? -1.5 : 2.5,
				({game, definition},index) => definition.zPos.get(index) * 3,
			],
			grid: [2, 2],
			animation: {
				frame: ({game, definition}, index) => index % 4,
				range: 4,
				frameRate: ({definition}, index) => {
					const { type } = definition.cell.get(index);
					if (type === GROUND_WATER) {
						return 10;
					}
					return 0;
				},
			},
			scale: [3.1, 3.1],
			count: ({game, definition},index) => game.sceneData.cells.length,
		},
		{	//	walls
			src: "blue-wall",
			brightness: 200,
			padding: 1,
			grid: [1, 2],
			animation: {
				frame: ({game, definition}, index) => index % 2,
				range: 2,
				frameRate: 0,
			},
			cell: ({game, definition},index) => {
				return game.sceneData.cells[Math.floor(index/4)];
			},
			grounded: ({game, definition},index) => {
				return definition.cell.get(index).grounded;
			},
			hidden: ({game, definition},index) => {
				return definition.grounded.get(index);
			},
			type: ({game, definition},index) => {
				switch(index % 4) {
					case 0:
						return SpriteType.Front;
					case 1:
						return SpriteType.Back;
					case 2:
						return SpriteType.LeftWall;
					case 3:
						return SpriteType.RightWall;
				}
			},
			xShift: ({game, definition},index) => {
				const type = definition.type.get(index);
				switch (type) {
					case SpriteType.Front:
						return 0;
					case SpriteType.Back:
						return 0;
					case SpriteType.LeftWall:
						return .5;
					case SpriteType.RightWall:
						return -.5;
				}
			},
			zShift: ({game, definition},index) => {
				const type = definition.type.get(index);
				switch (type) {
					case SpriteType.Front:
						return .5;
					case SpriteType.Back:
						return -.5;
					case SpriteType.LeftWall:
						return 0;
					case SpriteType.RightWall:
						return 0;
				}
			},
			xPos: ({game, definition},index) => definition.cell.get(index).x,
			zPos: ({game, definition},index) => definition.cell.get(index).z,
			pos: [
				({game, definition},index) => {
					const xShift = definition.xShift.get(index);
					return (definition.xPos.get(index) + xShift) * 3;
				},
				.5,
				({game, definition},index) => {
					const zShift = definition.zShift.get(index);
					return (definition.zPos.get(index) + zShift) * 3;
				},
			],
			scale: [3, 4],
			count: ({game, definition}, index) => game.sceneData.cells.length * 4,
		},	
	],
});