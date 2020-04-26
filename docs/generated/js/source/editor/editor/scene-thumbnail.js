/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SceneThumbnail {
	constructor(engine) {
		this.onShiftListener = [];
		if (engine.isEditor()) {
			engine.addEventListener("start", engine => {			
				this.setupSceneThumbnails(engine);
			});
			engine.addEventListener("sceneChange", ({name}) => {
				const sceneThumbnails = document.getElementById("scene-thumbnails");
				const tabs = sceneThumbnails.querySelectorAll(".scene-tab");
				for (let t = 0; t < tabs.length; t++) {
					const tab = tabs[t];
					if (tab.id === `tab-${name}`) {
						tab.classList.add("selected");
					} else {
						tab.classList.remove("selected");
					}
				}
			});
		}
	}

	setupSceneThumbnails({canvas}) {
		const sceneThumbnails = canvas.parentElement.insertBefore(document.createElement("div"), canvas);
		sceneThumbnails.id = "scene-thumbnails";
		sceneThumbnails.classList.add("tab-container");
		sceneThumbnails.style.display = "none";
		setTimeout(() => {
			sceneThumbnails.style.display = "";
		}, 1000);

		const tabs = sceneThumbnails.appendChild(document.createElement("div"));
		tabs.classList.add("tab-container");

		for (let s in engine.sceneManager.scenes) {
			const tab = tabs.appendChild(document.createElement("div"));
			tab.id = `tab-${s}`;
			tab.classList.add("tab");
			tab.classList.add("scene-tab");
			tab.innerText = s;
			tab.scene = s;
			tab.addEventListener("click", e => {
				engine.resetScene(e.currentTarget.scene);
			});
		}
		const space = sceneThumbnails.appendChild(document.createElement("div"));
		space.style.width = "100%";

		const button = sceneThumbnails.appendChild(document.createElement("div"));
		button.classList.add("panel-button");
		button.id="panel-button";
		button.innerText = "⬅️EDITOR";
		button.addEventListener("click", () => this.shiftPanel(true));
	}

	shiftPanel(doShift) {
		if (typeof(doShift) === "undefined") {
			document.getElementById("panel").classList.toggle("shifted");
			document.getElementById("editor").classList.toggle("shifted");
			document.getElementById("panel-button").classList.toggle("hidden");
			document.getElementById("panel-exit-button").classList.toggle("hidden");
		} else if (doShift) {
			document.getElementById("panel").classList.add("shifted");
			document.getElementById("editor").classList.add("shifted");
			document.getElementById("panel-button").classList.add("hidden");
			document.getElementById("panel-exit-button").classList.remove("hidden");
		} else {
			document.getElementById("panel").classList.remove("shifted");
			document.getElementById("editor").classList.remove("shifted");
			document.getElementById("panel-button").classList.remove("hidden");
			document.getElementById("panel-exit-button").classList.add("hidden");
		}

		const shifted = document.getElementById("panel").classList.contains("shifted");
		this.onShiftListener.forEach(callback => {
			callback(shifted);
		});
	}

	addEventListener(type, callback) {
		switch(type) {
			case "shift":
				if (this.onShiftListener.indexOf(callback) < 0) {
					this.onShiftListener.push(callback);
				}
				break;
		}
	}

	removeEventListener(type, callback) {
		switch(type) {
			case "shift":
				const index = this.onShiftListener.indexOf(callback);
				if (index >= 0) {
					this.onShiftListener.splice(index, 1);
				}
				break;
		}
	}
}

document.addEventListener("DOMContentLoaded", () => SceneThumbnail.instance = new SceneThumbnail(engine));