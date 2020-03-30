SceneManager.add({
	Game: class extends Game {
		constructor() {
			super();
			this.platforms = this.createPlatforms();
			this.cells = {};
			this.platforms.forEach(cell => {
				const {px, py} = cell;
				this.cells[`${px}_${py}`] = cell;
			});
		}

		createPlatforms() {
			function getMap() {
				return `
					.........
					.........
					....X....
					..XX.....
					....O..X.
					.XXXXXXX.
					..XXXXXX.
					.........
				`.trim().split("\n").map(a => a.trim().split(""));
			}

			function getCell(map, row, col) {
				return !map[row] ? null : map[row][col];
			}


			const map = getMap();
			const platforms = [];

			map.reverse();
			map.forEach((row, r) => {
				const y = r - map.length / 2;
				row.forEach((cell, c) => {
					const x = c - row.length / 2;
					switch(cell) {
						case 'O':
							this.tpBoy = {
								x, y: y - 1,
								dx: 0, dy: 0,
								direction: 1,
							};
							break;
						case 'X':
							const aboveCell = getCell(map, r + 1, c) === 'X';
							platforms.push({x, y, index: aboveCell ? 5 : 0, blocked:aboveCell, px:Math.floor(x), py:Math.floor(y) });
							break;
					}
				});
			});
			return platforms;
		}
	},
}, {
	settings: {
		thumbnail: "tp-boy",
		docBackground: 0x000000,
		background: 0xAACCFF,
	},
	light: {
		pos: [
			0,
			100,
			0,
		],
	},
	view: {
		angle: 45,
		cameraDistance: 10,
	},
	sprites: [
		{
			src: "tp-boy",
			pos: [
				({game}) => game.tpBoy.x,
				({game}) => game.tpBoy.y,
				0,
			],
			hotspot: [0, -.6],
			scale: [
				({game}) => game.tpBoy.direction,
				1,
			],
			grid: [3, 4],
			animation: {
				frame: 0,
				start: ({game, definition}, index) => game.tpBoy.walking ? 7 : 0,
				range: 4,
				frameRate: ({game}) => game.tpBoy.walking ? 15 : 5,
			},
			refresh: ({game, definition}) => {
				const platformOffset = .45;
				const platform = definition.onPlatform.get();
				const grounded = platform && game.tpBoy.y-platformOffset <= platform.y && game.tpBoy.dy <= 0;

				const speed = grounded ? .06 : .09;
				if (game.keys.controls.left > 0) {
					game.tpBoy.dx = -speed;
					game.tpBoy.direction = Math.sign(game.tpBoy.dx);
					game.tpBoy.walking = grounded;
				} else if (game.keys.controls.right > 0) {
					game.tpBoy.dx = speed;					
					game.tpBoy.direction = Math.sign(game.tpBoy.dx);
					game.tpBoy.walking = grounded;
				} else {
					game.tpBoy.walking = false;
				}

				const toPlatform = definition.onPlatform.get(game.tpBoy.dx * 5, game.tpBoy.dy);
				if (toPlatform && toPlatform.blocked) {
					game.tpBoy.dx = 0;
				}


				game.tpBoy.x += game.tpBoy.dx;
				game.tpBoy.dx *= .7;
				if (Math.abs(game.tpBoy.dx) < .01) {
					game.tpBoy.dx = 0;
				}

				if (grounded) {
					game.tpBoy.y = platform.y + platformOffset;
					game.tpBoy.dy = 0;
					if(game.keys.controls.up > 0) {
						game.tpBoy.dy = .4;
					}
				} else {
					const toPlatform2 = definition.onPlatform.get(game.tpBoy.dx, game.tpBoy.dy*3);
					if (toPlatform2 && game.tpBoy.dy > 0) {
						game.tpBoy.dy = 0;
					}
					game.tpBoy.dy = (game.tpBoy.dy - .03) * (game.tpBoy.dy < 0 ? .9 : 1);
				}

				game.tpBoy.y += game.tpBoy.dy;
				if (game.tpBoy.y < -5) {
					game.tpBoy.y = 5;
				}
			},
			onPlatform: ({game}, dx, dy) => {
				const { cells, tpBoy } = game;
				const px = Math.floor(tpBoy.x + (dx||0)), py = Math.floor(tpBoy.y + (dy||0));
				const cell = cells[`${px}_${py}`];
				return cell;
			}
		},
		{
			src: "grass-tile",
			hidden: ({game}, index) => {
				const px = Math.floor(game.tpBoy.x);
				const py = Math.floor(game.tpBoy.y);
				return Math.random() > .5 && px === Math.floor(game.platforms[index].x) && py === Math.floor(game.platforms[index].y);
			},
			size: [1, 1],
			grid: [2, 3],
			hotspot: [0, -.1],
			animation: {
				frame: ({game, definition}, index) => game.platforms[index].index,
				range: 6,
			},
			pos: [
				({game, definition}, index) => game.platforms[index].x,
				({game, definition}, index) => game.platforms[index].y,
				0,
			],
			count: ({game}) => game.platforms.length,
		},
	],
});