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
	firstScene: true,
	settings: {
		docBackground: 0x000000,
		background: 0xAACCFF,
		curvature: -3,
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
				({tpBoy}) => tpBoy.x,
				({tpBoy}) => tpBoy.y,
				0,
			],
			hotspot: [0, -.6],
			scale: [
				({tpBoy}) => tpBoy.direction,
				1,
			],
			grid: [3, 4],
			animation: {
				frame: 0,
				start: ({tpBoy}, definition, index) => tpBoy.dx ? 7 : 0,
				range: 4,
				frameRate: ({tpBoy}) => tpBoy.dx ? 15 : 5,
			},
		},
		{
			src: "grass-tile",
			refresh: ({tpBoy}, definition, index) => {
				const speed = .05;
				if (game.keys.controls.left > 0) {
					tpBoy.dx = -speed;
					tpBoy.direction = Math.sign(tpBoy.dx);
				} else if (game.keys.controls.right > 0) {
					tpBoy.dx = speed;					
					tpBoy.direction = Math.sign(tpBoy.dx);
				}
				tpBoy.x += tpBoy.dx;
				tpBoy.dx *= .7;
				if (Math.abs(tpBoy.dx) < .01) {
					tpBoy.dx = 0;
				}
			},
			size: [1.05, 1.05],
			grid: [2, 3],
			hotspot: [0, -.1],
			animation: {
				frame: ({platforms}, definition, index) => platforms[index].index,
				range: 6,
			},
			pos: [
				({platforms}, definition, index) => platforms[index].x,
				({platforms}, definition, index) => platforms[index].y,
				0,
			],
			count: ({platforms}) => platforms.length,
		},
	],
});