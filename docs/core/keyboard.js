/**
 *	Keyboard
 */
const KEY_LEFT_A = 'KeyA';
const KEY_RIGHT_D = 'KeyD';
const KEY_UP_W = 'KeyW';
const KEY_DOWN_S = 'KeyS';
const KEY_RIGHT_E = 'KeyE';
const KEY_DOWN_X = 'KeyX';
const KEY_ACTION_SPACE = 'Space';
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";

// KeyboardEvent: key='ArrowUp' | code='ArrowUp'
// KeyboardEvent: key='ArrowLeft' | code='ArrowLeft'
// KeyboardEvent: key='ArrowDown' | code='ArrowDown'
// KeyboardEvent: key='ArrowRight' | code='ArrowRight'

const KEY_LEFT_Q = 'KeyQ';	//	azerty
const KEY_UP_Z = 'KeyZ';	//	azerty

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
			action: 0,
		};

		document.addEventListener("keydown", e => {
			const {code} = e;
			keysDown[code] = code;
			delete keysUp[code];
			e.preventDefault();
		});
		document.addEventListener("keyup", e => {
			const {code} = e;
			keysUp[code] = code;
			delete keysDown[code];
			e.preventDefault();
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
	}

	handlerDirection(key, down, now) {
		const { controls, listener } = this;
		switch(key) {
			case KEY_LEFT_Q:
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
			case KEY_UP_Z:
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
			case KEY_RIGHT_E:
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
		for (let k in keysDown) {
			const key = keysDown[k];
			if (!keys[key] || keys[key] < 0) {
				keys[key] = now;
				listener.onKeyPress(key);
			}
			delete keysDown[k];
			this.handlerDirection(key, true, now);
		}
		for (let k in keysUp) {
			const key = keysUp[k];
			if (!keys[key] || keys[key] > 0) {
				keys[key] = -now;
				listener.onKeyRelease(key);
			}
			delete keysUp[k];
			this.handlerDirection(key, false, now);
		}
		return keyboard;
	}
}
