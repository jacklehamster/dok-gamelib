SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			step: 0,
		};
	}
}}, {
	settings: {
		background: 0xFFFFFF,
		music: {
			src: "isle",
			volume: .3,
			muted: ({game}) => game.data.muted,
		},
	},
	view: {
		tilt: .4,
		cameraDistance: 10,
		turn: ({game}) => game.now / 10000,
		depthEffect: {
			fading: 1,
		},
	},
	keyboard: {
		onActionRelease: ({game}) => {
			game.sceneData.step ++;
			if (game.sceneData.step > 1) {
				game.gotoScene("keep-alive");
			}
		},
	},
	spriteData: [
		{
			src: "water-mix",
			grid: [20, 20],
			padding: 1,
		},
		{
			src: "sand-ground",
			padding: 10,
		},
		TextUtils.makeSpriteData("primary-font"),
	],
	sprites: [
		TextUtils.makeSprite({
			text: "Jack Le Hamster presents",
			fontId: "primary-font",
			effects: {
				tintColor: 0xFF888888,
			},
			scale: [.5, .5],
			letterDistance: .5,
			faceUser: true,
			position: [
				-2, 3, 0,
			],
			hidden: ({game}) => game.sceneData.step > 0,
		}),		
		TextUtils.makeSprite({
			text: "Bruti   the   bear                   ",
			fontId: "primary-font",
			effects: {
				tintColor: 0xFF333333,
			},
			scale: [1.5, 1.5],
			letterDistance: 1.7,
			faceUser: true,
			position: [
				-.2,
				2,
				0,
			],
			hidden: ({game}) => game.sceneData.step > 0,
		}),
		TextUtils.makeSprite({
			text: "Press [space] to continue       ",
			fontId: "primary-font",
			effects: {
				tintColor: 0xFF777777,
			},
			scale: [.5, .5],
			letterDistance: .5,
			faceUser: true,
			position: [
				0.2, .8, 0,
			],
			hidden: ({game}) => game.sceneData.step > 0,
		}),

		TextUtils.makeSprite({
			text: `Bruti the stupid bear is on an island.
				He never listens to you, but try to keep him alive.
				Don't let Bruti jump into the water and drown.
				Help Bruti get food. Reach the food goals on the top right.
				[A,S,W,D] to move. [Q, E] to rotate.
				[SPACE] to RAISE / LOWER blocks (or REMOVE).
				[TAB] to switch block.
			`.split("\n").map(a => a.trim()).join("\n"),
			fontId: "primary-font",
			effects: {
				tintColor: 0xFF777777,
			},
			scale: [.4, .4],
			letterDistance: .4,
			lineDistance: .6,
			faceUser: true,
			position: [
				0.2, 3.5, 0,
			],
			hidden: ({game}) => game.sceneData.step !== 1,
		}),

		TextUtils.makeSprite({
			text: `Press [SPACE] to continue`,
			fontId: "primary-font",
			effects: {
				tintColor: 0xFFcc6677,
			},
			scale: [.4, .4],
			letterDistance: .4,
			lineDistance: .6,
			faceUser: true,
			position: [
				0.2, 1, 0,
			],
			hidden: ({game}) => game.sceneData.step !== 1,
		}),

		{
			src: "sand-ground",
			type: SpriteType.Floor,
			circleRadius: 1,
			effects: {
//				tintColor: 0x77CCCC99,
				brightness: 80,
			},
			pos: [0, .5, 0],
			scale: [9, 9],
		},
		{
			src: "water-mix",
			type: SpriteType.Water,
			scale: [2, 2],
			effects: {
				brightness: 50,
			},
			pos: [
				({game, definition}, index) => (index % 20 - 10) * definition.scale[0].get(),
				0,
				({game, definition}, index) => (Math.floor(index / 20) - 10) * definition.scale[0].get(),
			],
			animation: (_, index) => index,
			count: 400,
		},
	],
});