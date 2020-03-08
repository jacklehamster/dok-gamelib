SceneManager.add({
	firstScene: true,
	init: (game, scene) => {
		const { sceneData } = game;
		sceneData.cam = [0, 0, 0];
		sceneData.turn = 0;
	},
	refresh: (game, scene) => {
		const { sceneData, keyboard } = game;
		let moving = false;
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
//		if (sceneData.moving) {
			const tileSize = 3;
			const speed = .2;
			const dx = - Math.sin(sceneData.turn||0) * (sceneData.moving||0) * speed;
			const dz = Math.cos(sceneData.turn||0) * (sceneData.moving||0) * speed;
			const xGoal = Math.round(Math.round((sceneData.cam[0] + dx) / tileSize) * tileSize);
			const zGoal = Math.round(Math.round((sceneData.cam[2] + dz) / tileSize) * tileSize);					
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
//		}

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
	},
	keyboard: {
		onKeyPress: (game, key) => {},
		onLeftPress: (game) => {},
		onRightPress: (game) => {},
		onDownPress: (game) => {},
		onUpPress: (game) => {},
	},
	settings: {
		docBackground: 0,
		background: 0x080523,
		curvature: -1,
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
		cameraDistance: 4,
	},
	sprites: [
		{
			src: "blue-wall",
			type: SpriteType.Floor,
			pos: [
				(game, definition, index) => (Math.floor(index % 40) - 20) * 3,
				-.5,
				(game, definition, index) => (Math.floor(index / 40) - 20) * 3,
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
			count: 1600,
		},
		{
			src: "blue-wall",
			hidden: (game, definition, index) => {
				const x = Math.abs(game.evaluate(definition.xPos, definition, index));
				const z = Math.abs(game.evaluate(definition.zPos, definition, index));
				return x % 5 !== 1 || z % 3 !== 1;
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
			xPos: (game, definition, index) => Math.floor(Math.floor(index / 4) % 40) - 20,
			zPos: (game, definition, index) => Math.floor(Math.floor(index / 4) / 40) - 20,
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
			count: 1600 * 4,
		},
	],
});