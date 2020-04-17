SceneManager.add({
	Game: class extends Game {
		constructor() {
			super();
			this.seed = Math.random();

			const sceneData = this.sceneData = {};
			sceneData.cam = [0, 0, 0];
			sceneData.turn = 0;
			sceneData.cells = [];
			sceneData.cellMap = {};

			sceneData.zombies = [
				{
					fromX: 0,
					fromZ: -1,
					moveTime: 0,
					x: 0,
					z: -1,
				},
			];
			sceneData.life = 20;
			sceneData.hit = 0;
			sceneData.score = 0;
			sceneData.mapSize = 30;
			sceneData.zombieRange = 30;

			sceneData.npcs = [
			];
			this.resetMap(0, 0);
		}

		resetMap(x, z) {
			const { sceneData, now } = this;
			const { cellMap, cells } = sceneData;
			const mm = {};
			for (let zz = 0; zz < sceneData.mapSize; zz++) {
				for (let xx = 0; xx < sceneData.mapSize; xx++) {
					const xxx = xx-sceneData.mapSize/2 + x;
					const zzz = zz-sceneData.mapSize/2 + z;
					const tag = `${xxx}_${zzz}`;
					if (!cellMap[tag]) {
						const cell = {
							x: xxx, z: zzz,
							index: cells.length,
							corners: [
								(this.makeRandom(xxx-1,xxx,zzz-1,zzz) % 10) / 30,
								(this.makeRandom(xxx-1,xxx,zzz,zzz+1) % 10) / 30,
								(this.makeRandom(xxx,xxx+1,zzz,zzz+1) % 10) / 30,
								(this.makeRandom(xxx,xxx+1,zzz-1,zzz) % 10) / 30,
							],
							grounded: this.calcGrounded(xxx, zzz),
						};
						cellMap[tag] = cell;
						cells.push(cell);

						if (cell.grounded && Math.random() * sceneData.npcs.length < 2) {
							const src = Math.random() < .5 ? "dude" : "boolbool";
							sceneData.npcs.push({
								src,
								x: xxx, z: zzz,
								grid: src==='dude' ? [2,2] : [3,3],
							});
						}

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

		onProcessMove(posX, posZ) {
			const { sceneData } = this;
			const { zombies } = sceneData;
			sceneData.life = Math.min(sceneData.life + .2, 20);

			zombies.forEach(zombie => {
				const { x, z, dead } = zombie;
				if (!dead) {
					const dx = posX - x;
					const dz = posZ - z;
					zombie.fromX = x;
					zombie.fromZ = z;
					zombie.moveTime = this.now;
					if (Math.abs(dz) > Math.abs(dx) && this.isGrounded(x, z + Math.sign(dz))) {
						zombie.z += Math.sign(dz);
					} else if (this.isGrounded(x + Math.sign(dx), z)) {
						zombie.x += Math.sign(dx);
					} else if (this.isGrounded(x, z + Math.sign(dz))) {
						zombie.z += Math.sign(dz);					
					}

					if (zombie.x === posX && zombie.z === posZ) {
						sceneData.life--;
						sceneData.hit = this.now;
						if (sceneData.life < 0) {
							sceneData.gameOver = this.now;
						}
					}
				}
			});
		}

		makeRandom(...values) {
			let val = 0;
			for (let i = 0; i < values.length; i++) {
				val += (1 + Math.sin(this.seed + (13 + i) * values[i])) * 100000;
			}
			return Math.abs(val);
		}

		calcGrounded(xPos, zPos) {
			const value = Math.abs(Math.sin(xPos * .1 + zPos * .3));
			const value2 = Math.abs(Math.cos(zPos * .1 + xPos * .3));
			return Math.floor(this.seed + value * 100000) % 2 !== 1 || Math.floor(this.seed + value2 * 10000) % 2 !== 1;			
		}

		isGrounded(xPos, zPos) {
			const tag = `${xPos}_${zPos}`;
			const { sceneData } = this;
			const { cellMap } = sceneData;
			return cellMap[tag] ? cellMap[tag].grounded : false;
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
			const { zombies } = sceneData;
			this.resetMap(posX, posZ);
			this.onProcessMove(posX, posZ);
		}

		onShot() {
			const { sceneData } = this;
			const { zombies } = sceneData;
			const dx = Math.round(Math.sin(sceneData.turn||0));
			const dz = - Math.round(Math.cos(sceneData.turn||0));
			const posX = Math.floor(sceneData.cam[0] / 3);
			const posZ = Math.floor(sceneData.cam[2] / 3);

			const zombieMap = {};
			zombies.forEach(zombie => {
				const { x, z, dead } = zombie;
				if (!dead) {
					zombieMap[`${x}_${z}`] = zombie;
				}
			});

			for (let x = posX, z = posZ, n = 0; this.isGrounded(x, z) && n < sceneData.mapSize/2; x += dx, z += dz, n++) {
				if (zombieMap[`${x}_${z}`]) {
					zombieMap[`${x}_${z}`].dead = this.now;
					sceneData.score ++;
					for (let i = 0; i < 3; i++) {
						const newX = Math.floor(posX + (Math.random()/2) * sceneData.zombieRange);
						const newZ = Math.floor(posZ + (Math.random()/2) * sceneData.zombieRange);
						zombies.push(
							{
								fromX: newX,
								fromZ: newZ,
								moveTime: 0,
								x: newX,
								z: newZ,
							},
						);
					}
					break;
				}
			}

			this.onProcessMove(posX, posZ);
		}

	},
}, {
	settings: {
		docBackground: ({game}) => {
			const hitTime = game.now - game.sceneData.hit;
			return hitTime < 300 ? 0xaa0000 : 0;
		},
		background: ({game}) => {
			const hitTime = game.now - game.sceneData.hit;
			return hitTime < 300 ? 0xaa0000 : 0x080523;
		},
		curvature: -3,
	},
	light: {
		pos: [
			0,
			100,
			0,
		],
		ambient: 1,
		shininess: 2,
		specularStrength: 0.3,
		diffusionStrength: 0.5
	},
	view: {
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1],
			({game}) => game.sceneData.cam[2],
		],
		viewAngle: 45,
		height: .4,
		turn: ({game}) => game.sceneData.turn,
		cameraDistance: 3,
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
				const turnGoal = (Math.PI/2) * (Math.floor(sceneData.turn / (Math.PI/2)) + (sceneData.turnDirection > 0 ? 1 : 0));
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
	keyboard: {
		onActionPress: ({game}) => {
			if (!game.sceneData.gameOver) {
				game.sceneData.lastShot = game.now;
				game.onShot();
			}
		},
	},	
	sprites: [
		{
			src: "gun",
			hidden: ({game}) => game.sceneData.gameOver,
			animation: {
				start: ({game}) => {
					const { now, sceneData } = game;
					if (sceneData.lastShot) {
						const shootTime = now - sceneData.lastShot;
						const frame = Math.floor(shootTime / 50);
						if (frame < 2) {
							return frame+1;
						}
					}
					return 0;
				},
				range: 3,
				frameRate: 0,
			},
			pos: [
				({game}) => game.sceneData.cam[0],
				0,
				({game}) => game.sceneData.cam[2],
			],
			hotspot: [0, 0],
			grid: [2, 2],
			scale: [3, 3],
		},
		{
			src: "primary-font",
			tintColor: 0xFFcccccc,
			scale: [.2, .2],
			text: ({game}) => game.sceneData.score.toString(),
			hidden: ({game}) => !game.sceneData.score,
			refresh: ({definition, game}) => {
				const text = definition.text.get();
				const characters = game.getFont(definition.src.get()).characters;
				definition.charIndexes = text.split("").map(letter => characters.indexOf(letter));
			},
			pos: [
				({game}, index) => {
					const angle = game.view.turn.get();
					const dx = Math.cos(angle);
					const dz = Math.sin(angle);
					return game.sceneData.cam[0] + dx * ((index - 10) * .12);
				},
				1,
				({game}, index) => {
					const angle = game.view.turn.get();
					const dz = Math.sin(angle);
					const dx = Math.cos(angle);
					return game.sceneData.cam[2] + dz * ((index - 10) * .12);
				}
			],
			animation: {
				start: ({definition}, index) => definition.charIndexes[index],
				range: 1,//({definition}) => definition.characters.get().length,
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
			src: "creep-font",
			tintColor: 0xFFaa0066,
			scale: [1, 1],
			text: "Game Over",
			hidden: ({game: { sceneData }}) => !sceneData.gameOver,
			init: ({definition, game}) => {
				const text = definition.text.get();
				const characters = game.getFont(definition.src.get()).characters;
				definition.charIndexes = text.split("").map(letter => characters.indexOf(letter));
			},
			pos: [
				({game}, index) => {
					const angle = game.view.turn.get();
					const dx = Math.cos(angle);
					const dz = Math.sin(angle);
					return game.sceneData.cam[0] + dx * ((index - 3) * .25) - dz * (.01);
				},
				0,
				({game}, index) => {
					const angle = game.view.turn.get();
					const dz = Math.sin(angle);
					const dx = Math.cos(angle);
					return game.sceneData.cam[2] + dz * ((index - 3) * .25) - dx * (.01);
				}
			],
			animation: {
				start: ({definition}, index) => definition.charIndexes[index],
				//range: ({definition}) => definition.characters.get().length,
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
			src: "zombie",
			animation: {
				start: ({game, definition}, index) => {
					const {dead} = game.sceneData.zombies[index];
					if (dead) {
						const deathTime = game.now - dead;
						const frame = Math.floor(deathTime / 50);
						return Math.min(frame+2, 5);
					}
					return 0;
				},
				range: ({game, definition},index) => {
					const {dead} = game.sceneData.zombies[index];
					return dead ? 6 : 2;
				},
				frameRate: ({game, definition},index) => {
					const {dead} = game.sceneData.zombies[index];
					return dead ? 0 : 2;
				},
			},
			pos: [
				({game, definition},index) => {
					const zombie = game.sceneData.zombies[index];
					const time = game.now - zombie.moveTime;
					const progress = Math.min(1, time / 200);
					return progress * zombie.x * 3 + (1-progress) * zombie.fromX * 3;
				},
				-.5 * 3,
				({game, definition},index) => {
					const zombie = game.sceneData.zombies[index];
					const time = game.now - zombie.moveTime;
					const progress = Math.min(1, time / 200);
					return progress * zombie.z * 3 + (1-progress) * zombie.fromZ * 3;
				},
			],
			hotspot: [0, -.4],
			grid: [2, 3],
			scale: [3, 3],
			count: ({game}) => game.sceneData.zombies.length,
		},
		{
			src: "blue-wall",
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
			type: SpriteType.Floor,
			xPos: ({game, definition},index) => definition.cell.get(index).x,
			zPos: ({game, definition},index) => definition.cell.get(index).z,
			pos: [
				({game, definition},index) => definition.xPos.get(index) * 3,
				({game, definition},index) => (definition.grounded.get(index) ? -.5 : .5) * 3,
				({game, definition},index) => definition.zPos.get(index) * 3,
			],
			grid: [1, 2],
			animation: {
				start: ({game, definition},index) => index % 2,
				frameRate: 0,
			},
			scale: [3.1, 3.1],
			count: ({game, definition},index) => game.sceneData.cells.length,
		},
		{
			src: "blue-wall",
			grid: [1, 2],
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
				0,
				({game, definition},index) => {
					const zShift = definition.zShift.get(index);
					return (definition.zPos.get(index) + zShift) * 3;
				},
			],
			animation: {
				start: ({game, definition}, index) => index % 2,
				frameRate: 0,
			},
			scale: [3, 3],
			count: ({game, definition}, index) => game.sceneData.cells.length * 4,
		},
		{
			src: "primary-font",
			tintColor: 0xFFFFFFFF,
			animation: {
				range: ({definition}) => definition.characters.get().length,
				frameRate: 24,
			},
			characters: ({game, definition}) => game.getFont(definition.src.get()).characters,
			grid: [
				({definition}) => Math.ceil(Math.sqrt(definition.characters.get().length)),
				({definition}) => Math.ceil(definition.characters.get().length / definition.grid[0].get()),
			],
			grounded: ({game, definition},index) => {
				return definition.cell.get(index).grounded;
			},
			hidden: ({definition},index) => {
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
			cell: ({game, definition},index) => {
				return game.sceneData.cells[Math.floor(index/4)];
			},
			xShift: ({game, definition},index) => {
				const type = definition.type.get(index);
				switch (type) {
					case SpriteType.Front:
						return 0;
					case SpriteType.Back:
						return 0;
					case SpriteType.LeftWall:
						return .50001;
					case SpriteType.RightWall:
						return -.50001;
				}
			},
			zShift: ({game, definition},index) => {
				const type = definition.type.get(index);
				switch (type) {
					case SpriteType.Front:
						return .50001;
					case SpriteType.Back:
						return -.50001;
					case SpriteType.LeftWall:
						return 0;
					case SpriteType.RightWall:
						return 0;
				}
			},
			xPos: ({game, definition},index) => definition.cell.get(index).x,
			zPos: ({game, definition},index) => definition.cell.get(index).z,
			pos: [
				({game, definition}, index) => (definition.xPos.get(index) + definition.xShift.get(index)) * 3,
				0,
				({game, definition}, index) => (definition.zPos.get(index) + definition.zShift.get(index)) * 3,
			],
			scale: [2, 2],
			count: ({game, definition},index) => game.sceneData.cells.length * 4,
		},		
	],
});