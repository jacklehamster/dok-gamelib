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
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_TURN_RIGHT_E = 'KeyE';
const KEY_TURN_LEFT_Q = 'KeyQ';

class Keyboard {
	constructor(listener) {
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

		document.addEventListener("keydown", e => {
			if (this.active) {
				keysDown[e.code] = true;
				delete keysUp[e.code];
				e.preventDefault();
			}
		});
		document.addEventListener("keyup", e => {
			if (this.active) {
				keysUp[e.code] = true;
				delete keysDown[e.code];
				e.preventDefault();
			}
		});
		this.keysDown = keysDown;
		this.keysUp = keysUp;
		this.keys = keys;
		this.listener = listener;
		this.controls = controls;
		this.keyboard = {
			keys,
			controls,
		};
		this.active = true;
	}

	handlerDirection(key, down, now) {
		const { controls, listener } = this;
		switch(key) {
			case KEY_TURN_LEFT_Q:
				if (down && controls.turnLeft <= 0) {
					controls.turnLeft = now;
					listener.onTurnLeftPress();
				} else if (!down && controls.turnLeft >= 0) {
					controls.turnLeft = -now;
					listener.onTurnLeftRelease();
				}
				break;
			case KEY_TURN_RIGHT_E:
				if (down && controls.turnRight <= 0) {
					controls.turnRight = now;
					listener.onTurnRightPress();
				} else if (!down && controls.turnRight >= 0) {
					controls.turnRight = -now;
					listener.onTurnRightRelease();
				}
				break;
				break;
			case KEY_LEFT_A:
			case KEY_LEFT:
				if (down && controls.left <= 0) {
					controls.left = now;
					listener.onLeftPress();
				} else if (!down && controls.left >= 0) {
					controls.left = -now;
					listener.onLeftRelease();
				}
				break;
			case KEY_UP_W:
			case KEY_UP:
				if (down && controls.up <= 0) {
					controls.up = now;
					listener.onUpPress();
				} else if (!down && controls.up >= 0) {
					controls.up = -now;
					listener.onUpRelease();
				}
				break;
			case KEY_RIGHT_D:
			case KEY_RIGHT:
				if (down && controls.right <= 0) {
					controls.right = now;
					listener.onRightPress();
				} else if (!down && controls.right >= 0) {
					controls.right = -now;
					listener.onRightRelease();
				}
				break;
			case KEY_DOWN_X:
			case KEY_DOWN_S:
			case KEY_DOWN:
				if (down && controls.down <= 0) {
					controls.down = now;
					listener.onDownPress();
				} else if (!down && controls.down >= 0) {
					controls.down = -now;
					listener.onDownRelease();
				}
				break;
			case KEY_ACTION_SPACE:
				if (down && controls.action <= 0) {
					controls.action = now;
					listener.onActionPress();
				} else if (!down && controls.action >= 0) {
					controls.action = -now;
					listener.onActionRelease();
				}
				break;
		}
	}

	getKeyboard(now) {
		const { keys, keysDown, keysUp, listener, keyboard } = this;
		for (let key in keysDown) {
			if (!keys[key] || keys[key] < 0) {
				keys[key] = now;
				listener.onKeyPress(key);
			}
			delete keysDown[key];
			this.handlerDirection(key, true, now);
		}
		for (let key in keysUp) {
			if (!keys[key] || keys[key] > 0) {
				keys[key] = -now;
				listener.onKeyRelease(key);
			}
			delete keysUp[key];
			this.handlerDirection(key, false, now);
		}
		return keyboard;
	}
}
