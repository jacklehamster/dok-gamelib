const GROUND = 1;
const WALL = 2;

const seed = Math.random();

SceneManager.add({
	firstScene: true,
	init: (game, scene) => {
		const { sceneData } = game;
		sceneData.cam = [0, 0, 0];
		sceneData.turn = 0;
		sceneData.cells = [];
		sceneData.cellMap = {};
		scene.resetMap(game, 0, 0);
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
	},
	resetMap: (game, x, z) => {
		const { sceneData } = game;
		const { cellMap, cells } = sceneData;
		const mm = {};
		for (let zz = 0; zz < 40; zz++) {
			for (let xx = 0; xx < 40; xx++) {
				const xxx = xx-20 - x;
				const zzz = zz-20 - z;
				const tag = `${xxx}_${zzz}`;
				if (!cellMap[tag]) {
					const cell = {
						x: xxx,
						z: zzz,
						index: cells.length,
					};
					cellMap[tag] = cell;
					cells.push(cell);
				}
				mm[tag] = true;
			}
		}

		for (let tag in cellMap) {
			if (!mm[tag]) {
				const cell = cellMap[tag];
				const lastCell = cells[cells.length-1];
				cells.pop();
				lastCell.index = cell.index;
				cells[cell.index] = lastCell;
				delete cellMap[tag];
			}
		}
	},
	onProcessMove: (game) => {
		const { scene, sceneData } = game;
		const { zombies } = sceneData;
		sceneData.life = Math.min(sceneData.life + .2, 20);

		const posX = Math.floor(sceneData.cam[0] / 3);
		const posZ = Math.floor(sceneData.cam[2] / 3);
		zombies.forEach(zombie => {
			const { x, z, dead } = zombie;
			if (!dead) {
				const dx = -posX - x;
				const dz = -posZ - z;
				zombie.fromX = x;
				zombie.fromZ = z;
				zombie.moveTime = game.now;
				if (Math.abs(dz) > Math.abs(dx) && game.evaluate(scene.grounded, x, z + Math.sign(dz))) {
					zombie.z += Math.sign(dz);
				} else if (game.evaluate(scene.grounded, x + Math.sign(dx), z)) {
					zombie.x += Math.sign(dx);
				} else if (game.evaluate(scene.grounded, x, z + Math.sign(dz))) {
					zombie.z += Math.sign(dz);					
				}

				if (zombie.x === -posX && zombie.z === -posZ) {
					sceneData.life--;
					sceneData.hit = game.now;
					if (sceneData.life < 0) {
						sceneData.gameOver = game.now;
						document.getElementById("gameOver").innerText = "GAME OVER";
					}
//					console.log(sceneData.life);
				}
			}
		});
	},
	onChangeCell: (game, posX, posZ) => {
		const { scene, sceneData } = game;
		const { zombies } = sceneData;
		scene.resetMap(game, posX, posZ);
		scene.onProcessMove(game);
	},
	onShot: (game) => {
		const { sceneData, scene } = game;
		const { zombies } = sceneData;
		const dx = - Math.round(Math.sin(sceneData.turn||0));
		const dz = Math.round(Math.cos(sceneData.turn||0));
		const posX = Math.floor(sceneData.cam[0] / 3);
		const posZ = Math.floor(sceneData.cam[2] / 3);

		const zombieMap = {};
		zombies.forEach(zombie => {
			const { x, z, dead } = zombie;
			if (!dead) {
				zombieMap[`${x}_${z}`] = zombie;
			}
		});

		for (let x = -posX, z = -posZ, n = 0; game.evaluate(scene.grounded, x, z) && n < 10; x -= dx, z -= dz, n++) {
			if (zombieMap[`${x}_${z}`]) {
				zombieMap[`${x}_${z}`].dead = game.now;
				sceneData.score ++;
				document.getElementById("score").innerText = sceneData.score;
				for (let i = 0; i < 3; i++) {
					const newX = Math.floor(-posX + Math.random() * 40 - 20);
					const newZ = Math.floor(-posZ + Math.random() * 40 - 20);
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

		scene.onProcessMove(game);
	},
	grounded: (game, xPos, zPos) => {
		const value = Math.abs(Math.sin(xPos * .1 + zPos * .3));
		const value2 = Math.abs(Math.cos(zPos * .1 + xPos * .3));
		return Math.floor(seed + value * 100000) % 2 !== 1 || Math.floor(seed + value2 * 10000) % 2 !== 1;
	},
	canMove: (game, dx, dz) => {
		const { sceneData, scene } = game;
		const { cam } = sceneData;
		const tileSize = 3;
		const xDest = Math.round((cam[0] + dx) / tileSize);
		const zDest = Math.round((cam[2] + dz) / tileSize);
		return game.evaluate(scene.grounded, xDest, zDest);
	},
	refresh: (game, scene) => {
		const { sceneData, keyboard } = game;
		let moving = false;
		const tileSize = 3;
		const speed = .2;
		const cellX = Math.floor(sceneData.cam[0]/tileSize), cellZ = Math.floor(sceneData.cam[2]/tileSize);

		if (!sceneData.gameOver) {
			if (keyboard.controls.up <= 0 || keyboard.controls.down <= 0) {
				if (keyboard.controls.up > 0) {
					sceneData.moving = 1;
					moving = true;
				}
				if (keyboard.controls.down > 0) {
					sceneData.moving = -1;
					moving = true;
				}
			}
			let dx = - Math.sin(sceneData.turn||0) * (sceneData.moving||0) * speed;
			let dz = Math.cos(sceneData.turn||0) * (sceneData.moving||0) * speed;
			let xGoal = Math.round(Math.round((sceneData.cam[0] + dx) / tileSize) * tileSize);
			let zGoal = Math.round(Math.round((sceneData.cam[2] + dz) / tileSize) * tileSize);


			if ((Math.abs(dx) > .01 || Math.abs(dz) > .01) && !game.evaluate(scene.canMove, dx, dz)) {
				dx = 0;
				dz = 0;
				sceneData.moving = 0;
				moving = false;
				xGoal = Math.round(Math.round((sceneData.cam[0]) / tileSize) * tileSize);
				zGoal = Math.round(Math.round((sceneData.cam[2]) / tileSize) * tileSize);
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
		if (keyboard.controls.left <= 0 || keyboard.controls.right <= 0) {
			if (keyboard.controls.left > 0) {
				sceneData.turnDirection = -1;
				turning = true;
			}
			if (keyboard.controls.right > 0) {
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
			const newCellX = Math.floor(sceneData.cam[0]/tileSize), newCellZ = Math.floor(sceneData.cam[2]/tileSize);
			if (newCellX !== cellX || newCellZ !== cellZ) {
				scene.onChangeCell(game, newCellX, newCellZ);
			}
		}
	},
	settings: {
		docBackground: game => {
			const time = game.now - game.sceneData.hit;
			return time < 300 ? 0xaa0000 : 0;
		},
		background: game => {
			const time = game.now - game.sceneData.hit;
			return time < 300 ? 0xaa0000 : 0x080523;
		},
		curvature: -3,
	},
	view: {
		pos: [
			game => game.sceneData.cam[0],
			game => game.sceneData.cam[1],
			game => game.sceneData.cam[2],
		],
		angle: 45,
		height: .4,
		turn: game => game.sceneData.turn,
		cameraDistance: 3,
	},
	keyboard: {
		onActionPress: (game) => {
			if (!game.sceneData.gameOver) {
				game.sceneData.lastShot = game.now;
				game.scene.onShot(game);
			}
		},
	},	
	sprites: [
		{
			src: "gun",
			hidden: game => game.sceneData.gameOver,
			animation: {
				frame: game => {
					const { now, keyboard, sceneData } = game;
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
				game => -game.sceneData.cam[0],
				0,
				game => -game.sceneData.cam[2],
			],
			hotspot: [0, 0],
			grid: [2, 2],
			size: [3, 3],
		},
		{
			src: "zombie",
			animation: {
				frame: (game, definition, index) => {
					const {dead} = game.sceneData.zombies[index];
					if (dead) {
						const deathTime = game.now - dead;
						const frame = Math.floor(deathTime / 50);
						return Math.min(frame+2, 5);
					}
					return 0;
				},
				range: (game, definition, index) => {
					const {dead} = game.sceneData.zombies[index];
					return dead ? 6 : 2;
				},
				frameRate: (game, definition, index) => {
					const {dead} = game.sceneData.zombies[index];
					return dead ? 0 : 2;
				},
			},
			pos: [
				(game, definition, index) => {
					const zombie = game.sceneData.zombies[index];
					const time = game.now - zombie.moveTime;
					const progress = Math.min(1, time / 200);
					return progress * zombie.x * 3 + (1-progress) * zombie.fromX * 3;
				},
				-.5 * 3,
				(game, definition, index) => {
					const zombie = game.sceneData.zombies[index];
					const time = game.now - zombie.moveTime;
					const progress = Math.min(1, time / 200);
					return progress * zombie.z * 3 + (1-progress) * zombie.fromZ * 3;
				},
			],
			hotspot: [0, -1.2],
			grid: [2, 3],
			size: [3, 3],
			count: game => game.sceneData.zombies.length,
		},
		{
			src: "blue-wall",
			grounded: (game, definition, index) => {
				return game.evaluate(game.scene.grounded,
					game.evaluate(definition.xPos, definition, index),
					game.evaluate(definition.zPos, definition, index),
				);
			},
			type: SpriteType.Floor,
			xPos: (game, definition, index) => game.sceneData.cells[index].x,
			zPos: (game, definition, index) => game.sceneData.cells[index].z,
			pos: [
				(game, definition, index) => (game.evaluate(definition.xPos, definition, index)) * 3,
				(game, definition, index) => (game.evaluate(definition.grounded, definition, index) ? -.5 : .5) * 3,
				(game, definition, index) => (game.evaluate(definition.zPos, definition, index)) * 3,
			],
			light: (game, definition, index) => {
				const { scene } = game;
				const posX = - game.evaluate(scene.view.pos[0], scene);
				const posZ = - game.evaluate(scene.view.pos[2], scene);
				const x = Math.abs(posX - game.evaluate(definition.pos[0], definition, index));
				const z = Math.abs(posZ - game.evaluate(definition.pos[2], definition, index));
				return (x + z / 2) / 10;
			},
			grid: [1, 2],
			animation: {
				frame: (game, definition, index) => index % 2,
				range: 2,
				frameRate: 0,
			},
			size: [3.1, 3.1],
			count: (game, definition, index) => game.sceneData.cells.length,
		},
		{
			src: "blue-wall",
			grounded: (game, definition, index) => {
				return game.evaluate(game.scene.grounded,
					game.evaluate(definition.xPos, definition, index),
					game.evaluate(definition.zPos, definition, index),
				);
			},
			hidden: (game, definition, index) => {
				return game.evaluate(definition.grounded, definition, index);
			},
			type: (game, definition, index) => {
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
			xShift: (game, definition, index) => {
				const type = game.evaluate(definition.type, definition, index);
				switch (type) {
					case SpriteType.Front:
						return 0;
						break;
					case SpriteType.Back:
						return 0;
						break;
					case SpriteType.LeftWall:
						return .5;
						break;
					case SpriteType.RightWall:
						return -.5;
						break;
				}
			},
			zShift: (game, definition, index) => {
				const type = game.evaluate(definition.type, definition, index);
				switch (type) {
					case SpriteType.Front:
						return .5;
						break;
					case SpriteType.Back:
						return -.5;
						break;
					case SpriteType.LeftWall:
						return 0;
						break;
					case SpriteType.RightWall:
						return 0;
						break;
				}
			},
			xPos: (game, definition, index) => game.sceneData.cells[Math.floor(index/4)].x,
			zPos: (game, definition, index) => game.sceneData.cells[Math.floor(index/4)].z,
			pos: [
				(game, definition, index) => {
					const xShift = game.evaluate(definition.xShift, definition, index);
					return (game.evaluate(definition.xPos, definition, index) + xShift) * 3;
				},
				0,
				(game, definition, index) => {
					const zShift = game.evaluate(definition.zShift, definition, index);
					return (game.evaluate(definition.zPos, definition, index) + zShift) * 3;
				},
			],
			light: (game, definition, index) => {
				const { scene } = game;
				const posX = - game.evaluate(scene.view.pos[0], scene);
				const posZ = - game.evaluate(scene.view.pos[2], scene);
				const x = Math.abs(posX - game.evaluate(definition.pos[0], definition, index));
				const z = Math.abs(posZ - game.evaluate(definition.pos[2], definition, index));
				return (x + z / 2) / 10;
			},
			grid: [1, 2],
			animation: {
				frame: (game, definition, index) => index % 2,
				range: 2,
				frameRate: 0,
			},
			size: [3, 3],
			count: (game, definition, index) => game.sceneData.cells.length * 4,
		},
	],
});