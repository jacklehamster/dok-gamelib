SceneManager.add({Game: class extends Game {
	constructor() {
		super();
		this.sceneData = {
			turn: 0,
			turnGoal: 0,
			dok: {
				pos: [0, 0, 0],
				mov: [0, 0, 0],
				speed: 0,
				lastMov: [0, 0, 0],
			},
			cam: [ 0, 0, 0 ],
		};
	}

	loop() {
		const { sceneData, keys: { controls : { up, down, left, right, turnLeft, turnRight } } } = this;
		//	turn camera
		let dTurn = 0;
		const turnSpeed = .03;
		if (turnLeft > 0) {
			dTurn -= turnSpeed;
		}
		if (turnRight > 0) {
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
		if (up > 0) {
			dz --;
		}
		if (down > 0) {
			dz ++;
		}
		if (left > 0) {
			dx --;
		}
		if (right > 0) {
			dx ++;
		}
		const ddist = Math.sqrt(dx*dx + dz*dz);
		if (ddist > 0) {
			sceneData.dok.mov[0] = dx;
			sceneData.dok.mov[2] = dz;
			sceneData.dok.speed += .02;
			if (sceneData.dok.mov[0]) {
				sceneData.dok.lastMov[0] = sceneData.dok.mov[0];
			}
			if (sceneData.dok.mov[2]) {
				sceneData.dok.lastMov[2] = sceneData.dok.mov[2];				
			}
		}
		sceneData.dok.speed *= .8;

		if (sceneData.dok.speed > .0001) {
		    const sin = Math.sin(sceneData.turn);
		    const cos = Math.cos(sceneData.turn);
		    const [ dx, dy, dz ] = sceneData.dok.mov;
			const ddist = Math.sqrt(dx*dx + dz*dz);
		    const vx = cos * dx / ddist - sin * dz / ddist;
		    const vy = sin * dx / ddist + cos * dz / ddist;

			sceneData.dok.pos[0] += vx * sceneData.dok.speed;
			sceneData.dok.pos[1] += dy * sceneData.dok.speed;
			sceneData.dok.pos[2] += vy * sceneData.dok.speed;
		} else {
			sceneData.dok.speed = 0;
		}

		//	camera follow
		sceneData.cam[0] += (sceneData.dok.pos[0] - sceneData.cam[0]) / 20;
		sceneData.cam[1] += (sceneData.dok.pos[1] - sceneData.cam[1]) / 20;
		sceneData.cam[2] += (sceneData.dok.pos[2] - sceneData.cam[2]) / 20;			
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
			],
		},
	],
	sprites: [
		SpriteUtils.makeSprite({
			src: "dok",
			position: [
				({game: { sceneData: { dok }}}) => game.sceneData.dok.pos[0],
				({game: { sceneData: { dok }}}) => game.sceneData.dok.pos[1],
				({game: { sceneData: { dok }}}) => game.sceneData.dok.pos[2],
			],
			scale: [
				({game: {sceneData: { dok }}}) => (dok.lastMov[0] || 1) * 2.4,
				2.4,
			],
			animation: ({game: { sceneData: { dok }}}) => {
				return dok.speed > .01 ? (dok.lastMov[2] < 0 ? "walk-up" : "walk") : (dok.lastMov[2] < 0 ? "idle-up" : "idle");
			},
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