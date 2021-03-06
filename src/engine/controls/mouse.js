/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	Mouse
 */

class Mouse {
	constructor(workerManager, canvas, document, listener) {
		if (document) {
			document.addEventListener("mousemove", e => {
				if (this.active) {
					this.mouseEventToPosition(e, this.newPosition);
					this.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					if (workerManager) {
						workerManager.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					}
					e.preventDefault();
				}
			});
			document.addEventListener("mousedown", e => {
				if (this.active) {
					this.mouseEventToPosition(e, this.newPosition);
					this.newPosition.mouseDown = true;
					this.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					if (workerManager) {
						workerManager.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					}
					e.preventDefault();
				}
			});
			document.addEventListener("mouseup", e => {
				if (this.active) {
					this.mouseEventToPosition(e, this.newPosition);
					this.newPosition.mouseDown = false;
					this.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					if (workerManager) {
						workerManager.onMouse(this.newPosition.x, this.newPosition.y, this.newPosition.mouseDown);
					}
					e.preventDefault();
				}
			});
		}
		this.canvas = canvas;
		this.listener = listener;
		this.active = true;
		this.dirty = false;
		this.newPosition = {
			x: 0,
			y: 0,
			mouseDown: false,
		};
		this.position = {
			x: 0,
			y: 0,
			mouseDown: 0,
		};
	}

	refresh(currentScene, now) {
		const newActive = currentScene.mouse.active.get();
		if (newActive !== this.active) {
			this.active = newActive;
			if (!this.active) {
				this.newPosition.mouseDown = false;
				this.dirty = true;
			}
		}
		if (this.dirty) {
			this.getMouse(now);
		}
	}

	onMouse(x, y, mouseDown) {
		if (this.active) {
			this.newPosition.x = x;
			this.newPosition.y = y;
			this.newPosition.mouseDown = mouseDown;
			this.dirty = true;
		}
	}

	mouseEventToPosition(event, position) {
		const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.canvas;
		const x = 2 * (event.pageX - offsetLeft) / offsetWidth;
		const y = 2 * (event.pageY - offsetTop) / offsetHeight;
		position.x = Math.max(0, Math.min(2, x)) - 1;
		position.y = - (Math.max(0, Math.min(2, y)) - 1);
	}

	getMouse(now) {
		const { listener, position, newPosition, active } = this;
		if (newPosition.x !== position.x || newPosition.y !== position.y) {
			position.x = newPosition.x;
			position.y = newPosition.y;
			if (active) {
				listener.onMouseMove(position);
			}
		}

		if (newPosition.mouseDown && position.mouseDown <= 0 || !newPosition.mouseDown && position.mouseDown >= 0) {
			position.mouseDown = newPosition.mouseDown ? now : -now;
			if (newPosition.mouseDown) {
				if (active) {
					listener.onMouseDown(position);
				}
			} else {
				if (active) {
					listener.onMouseUp(position);
				}
			}
		}
		this.dirty = false;
		return position;
	}
}