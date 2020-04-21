SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: [0, 0],
		};
	}

	loop() {
		const { sceneData, keys } = this;
		//	turn camera
		let dTurn = 0;
		const turnSpeed = .1;
		if (keys.controls.turnLeft > 0) {
			dTurn -= turnSpeed;
		}
		if (keys.controls.turnRight > 0) {
			dTurn += turnSpeed;
		}
		const turnStep = Math.PI / 8;
		if (dTurn) {
			sceneData.turn += dTurn;
			sceneData.turnGoal = Math.floor(sceneData.turn / turnStep) * turnStep + (dTurn>0 ? turnStep : 0);
		} else {
			const turnDiff = sceneData.turnGoal - sceneData.turn;
			if (Math.abs(turnDiff) >= 0.01) {
				sceneData.turn += turnDiff / 5;
			} else {
				sceneData.turn = sceneData.turnGoal = sceneData.turnGoal % (Math.PI * 2);
			}
		}

		//	move dobuki
		let dx = 0, dz = 0;
		const moveSpeed = .05;
		if (keys.controls.up > 0) {
			dz --;
		}
		if (keys.controls.down > 0) {
			dz ++;
		}
		if (keys.controls.left > 0) {
			dx --;
		}
		if (keys.controls.right > 0) {
			dx ++;
		}
		const ddist = Math.sqrt(dx*dx + dz*dz);
		if (ddist > 0) {
		    const sin = Math.sin(sceneData.turn);
		    const cos = Math.cos(sceneData.turn);
		    const vx = cos * dx / ddist - sin * dz / ddist;
		    const vy = sin * dx / ddist + cos * dz / ddist;

			sceneData.dok[0] += vx * moveSpeed;
			sceneData.dok[1] += vy * moveSpeed;
		}
	}

}}, {
	firstScene: true,
	settings: {
		background: 0x000000,
	},
	view: {
		tilt: .4,
		cameraDistance: 10,
		turn: ({game}) => game.sceneData.turn,
	},
	refresh: ({game}) => game.loop(),
	spriteData: [
		{
			src: "dok",
			spriteSize: [292, 362],
			grid: [14, 8],
			padding: 1,
			animations: [
				[ "idle", "still*20,blink" ],
				[ "still", "2" ],
				[ "blink", "0-2" ],
				[ "talk", "2-5" ],
				[ "talk-mad", "6-7" ],
				[ "talk-surprised", "8-9" ],
				[ "talk-sad", "10-11" ],
				[ "talk-4th-wall", "12-15" ],
				[ "walk", "16-25" ],
				[ "walk-up", "26-36" ],
				[ "knocked-up", "37-52" ],
				[ "birds", "53-57" ],
				[ "cast-spell", "58-67" ],
				[ "pick-up", "68-78" ],
				[ "fly", "79-86" ],
				[ "dancing", "87-94" ],
			],
		},
	],
	sprites: [
		SpriteUtils.makeSprite({
			src: "dok",
			position: [
				({game}) => game.sceneData.dok[0],
				0,
				({game}) => game.sceneData.dok[1],				
			],
			scale: [2.4, 2.4],
			shadowColor: 0xFF333333,
			spriteSize: [292, 362],
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