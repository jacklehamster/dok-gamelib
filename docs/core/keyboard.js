/**
 *	Keyboard
 */
const KEY_LEFT_A = 65;
const KEY_RIGHT_D = 68;
const KEY_UP_W = 87;
const KEY_DOWN_S = 83;
const KEY_RIGHT_E = 69;
const KEY_DOWN_X = 88;
const KEY_ACTION_SPACE = 32;

const KEY_LEFT_Q = 81;	//	azerty
const KEY_UP_Z = 90;	//	azerty

class Keyboard {
	constructor(listener) {
		const keysDown = {};
		const keysUp = {};
		const keys = [];
		const controls = {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			action: 0,
		};

		document.addEventListener("keydown", e => {
			const {keyCode} = e;
			keysDown[keyCode] = keyCode;
			delete keysUp[keyCode];
			e.preventDefault();
		});
		document.addEventListener("keyup", e => {
			const {keyCode} = e;
			keysUp[keyCode] = keyCode;
			delete keysDown[keyCode];
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
