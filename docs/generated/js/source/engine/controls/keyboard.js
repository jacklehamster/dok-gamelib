/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	Keyboard
 */
const KEY_LEFT_A = 'KeyA';
const KEY_RIGHT_D = 'KeyD';
const KEY_UP_W = 'KeyW';
const KEY_DOWN_S = 'KeyS';
const KEY_DOWN_X = 'KeyX';
const KEY_ACTION_SPACE = 'Space';
const KEY_ACTION_SHIFT_LEFT = 'ShiftLeft';
const KEY_ACTION_SHIFT_RIGHT = 'ShiftRight';
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_TURN_RIGHT_E = 'KeyE';
const KEY_TURN_LEFT_Q = 'KeyQ';
const KEY_TURN_LEFT_BRACKET = 'BracketLeft';
const KEY_TURN_RIGHT_BRACKET = 'BracketRight';

class Keyboard {
	constructor(workerManager, document, listener) {
		const keysDown = {};
		const keysUp = {};
		const keys = {};
		const controls = {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			turnLeft: 0,
			turnRight: 0,
			action: 0,
		};
		const actions = {
			turn: 0,
			mov: {
				x: 0,
				y: 0,
				dist: 0,
			},
		};

		if (document) {
			document.addEventListener("keydown", e => {
				if (this.active) {
					this.onKeyDown(e.code);
					if (workerManager) {
						workerManager.onKey("keydown", e.code);
					}
					e.preventDefault();
				}
			});
			document.addEventListener("keyup", e => {
				if (this.active) {
					this.onKeyUp(e.code);
					if (workerManager) {
						workerManager.onKey("keyup", e.code);
					}
					e.preventDefault();
				}
			});
		}
		this.dirty = false;
		this.keysDown = keysDown;
		this.keysUp = keysUp;
		this.keys = keys;
		this.listener = listener;
		this.keyboard = {
			keys,
			controls,
			actions,
		};
		this.active = true;
	}

	refresh(currentScene, now) {
		const newActive = currentScene.keyboard.active.get();
		if (newActive !== this.active) {
			this.active = newActive;
			if (this.dirty) {
				this.getKeyboard(now);
			}
		}
	}

	onKeyDown(code) {
		if (this.active) {
			this.keysDown[code] = true;
			delete this.keysUp[code];
			this.dirty = true;
		}
	}

	onKeyUp(code) {
		if (this.active) {
			this.keysUp[code] = true;
			delete this.keysDown[code];
			this.dirty = true;
		}
	}

	handleTurnChanged() {
		const { actions, controls } = this.keyboard;
		let dTurn = 0;
		if (controls.turnLeft > 0) {
			dTurn --;
		}
		if (controls.turnRight > 0) {
			dTurn ++;
		}
		actions.turn = dTurn;
	}

	handleMoveChanged() {
		const { actions, controls } = this.keyboard;
		let dx = 0, dy = 0;
		const moveSpeed = .05;
		if (controls.up > 0) {
			dy --;
		}
		if (controls.down > 0) {
			dy ++;
		}
		if (controls.left > 0) {
			dx --;
		}
		if (controls.right > 0) {
			dx ++;
		}
		const dist = Math.sqrt(dx*dx + dy*dy);
		actions.mov.dist = dist;
		if (dist) {
			actions.mov.x = dx;
			actions.mov.y = dy;
		} else {
			actions.mov.x = 0;
			actions.mov.y = 0;
		}
	}

	handleDirection(key, down, now) {
		const { keyboard: { controls }, listener } = this;
		switch(key) {
			case KEY_TURN_LEFT_Q:
			case KEY_TURN_LEFT_BRACKET:
				if (down && controls.turnLeft <= 0) {
					controls.turnLeft = now;
					listener.onTurnLeftPress();
					this.handleTurnChanged();
				} else if (!down && controls.turnLeft >= 0) {
					controls.turnLeft = -now;
					listener.onTurnLeftRelease();
					this.handleTurnChanged();
				}
				break;
			case KEY_TURN_RIGHT_E:
			case KEY_TURN_RIGHT_BRACKET:
				if (down && controls.turnRight <= 0) {
					controls.turnRight = now;
					listener.onTurnRightPress();
					this.handleTurnChanged();
				} else if (!down && controls.turnRight >= 0) {
					controls.turnRight = -now;
					listener.onTurnRightRelease();
					this.handleTurnChanged();
				}
				break;
			case KEY_LEFT_A:
			case KEY_LEFT:
				if (down && controls.left <= 0) {
					controls.left = now;
					listener.onLeftPress();
					this.handleMoveChanged();
				} else if (!down && controls.left >= 0) {
					controls.left = -now;
					listener.onLeftRelease();
					this.handleMoveChanged();
				}
				break;
			case KEY_UP_W:
			case KEY_UP:
				if (down && controls.up <= 0) {
					controls.up = now;
					listener.onUpPress();
					this.handleMoveChanged();
				} else if (!down && controls.up >= 0) {
					controls.up = -now;
					listener.onUpRelease();
					this.handleMoveChanged();
				}
				break;
			case KEY_RIGHT_D:
			case KEY_RIGHT:
				if (down && controls.right <= 0) {
					controls.right = now;
					listener.onRightPress();
					this.handleMoveChanged();
				} else if (!down && controls.right >= 0) {
					controls.right = -now;
					listener.onRightRelease();
					this.handleMoveChanged();
				}
				break;
			case KEY_DOWN_X:
			case KEY_DOWN_S:
			case KEY_DOWN:
				if (down && controls.down <= 0) {
					controls.down = now;
					listener.onDownPress();
					this.handleMoveChanged();
				} else if (!down && controls.down >= 0) {
					controls.down = -now;
					listener.onDownRelease();
					this.handleMoveChanged();
				}
				break;
			case KEY_ACTION_SHIFT_LEFT:
			case KEY_ACTION_SHIFT_RIGHT:
			case KEY_ACTION_SPACE:
				if (down && controls.action <= 0) {
					controls.action = now;
					listener.onActionPress();
					this.handleMoveChanged();
				} else if (!down && controls.action >= 0) {
					controls.action = -now;
					listener.onActionRelease();
					this.handleMoveChanged();
				}
				break;
		}
	}

	getKeyboard(now) {
		const { keys, keysDown, keysUp, listener, keyboard, active } = this;
		for (let key in keysDown) {
			if (!keys[key] || keys[key] < 0) {
				keys[key] = now;
				listener.onKeyPress(key);
			}
			delete keysDown[key];
			this.handleDirection(key, true, now);
		}
		for (let key in keysUp) {
			if (!keys[key] || keys[key] > 0) {
				keys[key] = -now;
				listener.onKeyRelease(key);
			}
			delete keysUp[key];
			this.handleDirection(key, false, now);
		}
		this.dirty = false;
		return keyboard;
	}
}
