SceneManager.add({
	Game: class extends Game {
		constructor() {
			super();
			this.platforms = this.createPlatforms();
		}

		getMap() {
			return `
				.........
				....O....
				..XXXXX..
				..XXXXX..
				.........
				.........
			`.trim().split("\n").map(a => a.trim().split(""));
		}

		getCell(map, row, col) {
			return !map[row] ? null : map[row][col];
		}

		createPlatforms() {
			const map = this.getMap();
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
								dx: 0,
								direction: 1,
							};
							break;
						case 'X':
							const aboveCell = this.getCell(map, r + 1, c) === 'X';
							platforms.push({x, y, index: aboveCell ? 5 : 0 });
							break;
					}
				});
			});
			return platforms;
		}
	},
}, {
	settings: {
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
		cameraDistance: 6,
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
				start: ({game, definition}, index) => game.tpBoy.dx ? 7 : 0,
				range: 4,
				frameRate: ({game}) => game.tpBoy.dx ? 15 : 5,
			},
		},
		{
			src: "grass-tile",
			refresh: ({game, definition}, index) => {
				const speed = .05;
				if (game.keys.controls.left > 0) {
					game.tpBoy.dx = -speed;
					game.tpBoy.direction = Math.sign(game.tpBoy.dx);
				} else if (game.keys.controls.right > 0) {
					game.tpBoy.dx = speed;					
					game.tpBoy.direction = Math.sign(game.tpBoy.dx);
				}
				game.tpBoy.x += game.tpBoy.dx;
				game.tpBoy.dx *= .7;
				if (Math.abs(game.tpBoy.dx) < .01) {
					game.tpBoy.dx = 0;
				}
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