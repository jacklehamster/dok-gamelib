SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: {
				pos: [0, 0, 0],
				mov: { x: 0, y: 0, z: 0 },
				heightAboveGround: 0,
				speed: 0,
				grounded: true,
			},
			cam: [ 0, 0, 0 ],
		};
	}

	loop() {
		const { sceneData, keys: { actions: { mov, turn }, controls } } = this;
		const { dok } = sceneData;
		//	turn camera
		const turnSpeed = .03;
		const turnStep = Math.PI / 8;
		if (turn) {
			sceneData.turn += turn * turnSpeed;
			sceneData.turnGoal = (Math.floor(sceneData.turn / turnStep) + (turn > 0 ? 1 : 0)) * turnStep;
		} else {
			const turnDiff = sceneData.turnGoal - sceneData.turn;
			if (Math.abs(turnDiff) >= 0.01) {
				sceneData.turn += turnDiff / 5;
			} else {
				sceneData.turn = sceneData.turnGoal = sceneData.turnGoal % (Math.PI * 2);
			}
		}

		//	move dobuki
		if (mov.dist > 0) {
			dok.speed += .02;
			if (mov.x) {
				dok.mov.x = mov.x;
			}
			if (mov.y) {
				dok.mov.z = mov.y;
			}
		}
		dok.speed *= .8;

		if (dok.speed > .0001) {
			const [ dx, dz ] = MotionUtils.getNormalDirection(sceneData.turn, mov.x, mov.y);
			dok.pos[0] += dx * dok.speed * (dok.grounded ? 1 : 1.5);
			dok.pos[2] += dz * dok.speed * (dok.grounded ? 1 : 1.5);
		} else {
			sceneData.dok.speed = 0;
		}

		if (dok.grounded) {
			if (controls.action > 0) {
				dok.mov.y = .25;
				dok.grounded = false;
			}
		} else {
			dok.mov.y -= .015;
			dok.heightAboveGround += dok.mov.y;
			if (dok.heightAboveGround <= 0) {
				dok.heightAboveGround = 0;
				dok.mov.y = 0;
				dok.grounded = true;
			}
		}

		//	camera follow
		MotionUtils.follow(sceneData.cam, sceneData.dok.pos, .05, 0);
	}

}}, {
	settings: {
		background: 0x000000,
	},
	view: {
		tilt: .4,
		cameraDistance: 10,
		turn: ({game}) => game.sceneData.turn,
		pos: [
			({game}) => game.sceneData.cam[0],
			({game}) => game.sceneData.cam[1],
			({game}) => game.sceneData.cam[2],
		],
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			src: "dok",
			spriteSize: [292, 362],
			grid: [14, 8],
			padding: 1,
			frameRate: 24,
			animations: [
				[ "idle", "still*100,blink" ],
				[ "still", "2" ],
				[ "blink", "0*3,0-2,2*3" ],
				[ "talk", "2-5" ],
				[ "talk-mad", "6-7" ],
				[ "talk-surprised", "8-9" ],
				[ "talk-sad", "10-11" ],
				[ "talk-4th-wall", "12-15" ],
				[ "walk", "16-25" ],
				[ "idle-up", "26"],
				[ "walk-up", "27-37" ],
				[ "knocked-up", "38-53" ],
				[ "birds", "54-58" ],
				[ "cast-spell", "59-68" ],
				[ "pick-up", "69-79" ],
				[ "fly", "80-87" ],
				[ "dancing", "88-95" ],
				[ "jump", "16" ],
				[ "jump-up", "27" ],
			],
		},
	],
	sprites: [
		SpriteUtils.makeSprite({
			src: "dok",
			position: [
				({game: { sceneData: { dok: { pos } }}}) => pos[0],
				({game: { sceneData: { dok: { pos } }}}) => pos[1],
				({game: { sceneData: { dok: { pos } }}}) => pos[2],
			],
			scale: [
				({game: {sceneData: { dok: { mov } }}}) => (mov.x || 1) * 2.4,
				2.4,
			],
			heightAboveGround: ({game: { sceneData: { dok: { heightAboveGround } }}}) => heightAboveGround,
			animation: ({game: { sceneData: { dok: { speed, mov, grounded } }}}) => {
				return !grounded ? (mov.z < 0 ? "jump-up" : "jump") : speed > .01 ? (mov.z < 0 ? "walk-up" : "walk") : (mov.z < 0 ? "idle-up" : "idle");
			},
			shadowColor: 0xFF333333,
			spriteSize: [292, 362],
		}),
		SpriteUtils.makeSprite({
			src: "tree",
			position: [-1, 0, -1],
			scale: [3, 3],
			shadowColor: 0xFF333333,
		}),
		{
			src: "home-floor",
			type: SpriteType.Floor,
			circleRadius: 1,
			tintColor: 0x88995555,
			pos: [0, -1.15, 0],
			scale: [10, 10],
			brightness: 80,
		},
	],
});