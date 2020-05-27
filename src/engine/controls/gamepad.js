/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class Gamepad {
	constructor(window) {
		window.addEventListener("webkitgamepadconnected", console.log);
		window.addEventListener("mozgamepadconnected", console.log);
		window.addEventListener("gamepadconnected", e => {
			console.log(`%c${e.gamepad.id}%c connected.`, 'color: pink; display:inline', 'color:; display:inline');
			if (e.gamepad.vibrationActuator) {
				e.gamepad.vibrationActuator.playEffect("dual-rumble", {
					startDelay: 0,
					duration: 200,
					weakMagnitude: .2,
					strongMagnitude: .5,
				});
			}
			this.gamepads[e.gamepad.index] = true;
			this.axes.length = e.gamepad.axes.length;
			this.buttons.length = e.gamepad.buttons.length;
			this.axes.fill(0);
			this.buttons.fill(0);
		});
		window.addEventListener("gamepaddisconnected", e => {
			delete this.gamepads[e.gamepad.index];
		});
		this.gamepads = [];
		this.active = true;
		this.axes = [];
		this.buttons = [];
		const self = this;
		const f = time => {
			this.gamepads.forEach((active, index) => {
				if (active) {
					const gamepad = navigator.getGamepads()[index];
					let changed = false;
					for (let i = 0; i < self.axes.length; i++) {
						const value = Math.round(gamepad.axes[i] * 100) / 100;
						if (self.axes[i] !== value) {
							self.axes[i] = value;
							changed = true;
						}
					}
					for (let i = 0; i < self.buttons.length; i++) {
						if (self.buttons[i] !== gamepad.buttons[i].value) {
							self.buttons[i] = gamepad.buttons[i].value;
							changed = true;
						}
					}
					if (changed) {
						console.log(self.axes, self.buttons);
					}
				}
			});
			requestAnimationFrame(f);
		};
		requestAnimationFrame(f);
	}

	getGamePad(now) {
	}
}