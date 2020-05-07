/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	FocusFixer
  */

class FocusFixer {
	constructor(canvas) {
		this.canvas = canvas;
		this.input = document.createElement("input");
		this.fix();
	}

	fix() {
		const { input } = this;
		input.setAttribute("contenteditable", "");
		input.setAttribute("readonly", "");
		input.classList.add("focus-fixer-input");

		window.addEventListener("DOMContentLoaded", () => {
			document.body.appendChild(input);
			this.gainFocus();
		});
		window.addEventListener("focus", () => this.gainFocus());
		window.addEventListener("blur", () => this.lostFocus());
		this.canvas.addEventListener("mousedown", () => this.gainFocus());
	}

	lostFocus() {

	}

	gainFocus() {
		this.input.focus();
	}
}
