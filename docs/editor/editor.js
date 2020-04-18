/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SourceCode {
	constructor(engine) {
		this.engine = engine;
		this.videos = {};
		if (engine.isEditor()) {
			engine.addEventListener("start", engine => {
				document.getElementById('editor').classList.remove("hidden");

				engine.addEventListener("sceneChange", ({config}) => {
					this.refreshView();
				});

				const TABS = [
					"scene-code",
					"config",
					"assets",

					"design-tab",
					"code-tab",
				];

				TABS.forEach(tab => {
					document.getElementById(tab).addEventListener("mousedown", () => {
						this.selectTab(tab);
					});
				});


				SceneThumbnail.instance.addEventListener("shift", shifted => {
					if (!shifted) {
						for (let v in this.videos) {
							this.videos[v].pause();
						}
						this.engine.keyboard.active = true;
					} else {
						this.refreshView();
						this.engine.keyboard.active = false;
					}
				});
			});
		}
	}

	selectTab(id) {
		{
			const tabs = document.querySelectorAll("#editor-tabs > .tab");
			const selectedTab = document.querySelector(`#editor-tabs > .tab#${id}`)
			if (selectedTab) {
				for (let i = 0; i < tabs.length; i++) {
					const tab = tabs[i];
					if (tab.id === id) {
						tab.classList.add("selected");
					} else {
						tab.classList.remove("selected");
					}
				}
			}
		}
		{
			const tabs = document.querySelectorAll("#code-tabs > .tab");
			const selectedTab = document.querySelector(`#code-tabs > .tab#${id}`)
			if (selectedTab) {
				for (let i = 0; i < tabs.length; i++) {
					const tab = tabs[i];
					if (tab.id === id) {
						tab.classList.add("selected");
					} else {
						tab.classList.remove("selected");
					}
				}
			}
		}
		this.refreshView();
	}

	selectedEditorTab() {
		const tabs = document.querySelectorAll("#editor-tabs > .tab");
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab.classList.contains("selected")) {
				return tab.id;
			}
		}
		return null;
	}

	selectedCoderTab() {
		const tabs = document.querySelectorAll("#code-tabs > .tab");
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab.classList.contains("selected")) {
				return tab.id;
			}
		}
		return null;
	}

	refreshView() {
		for (let v in this.videos) {
			this.videos[v].pause();
		}

		document.getElementById("source-code").style.display = "none";
		document.getElementById("assets-container").style.display = "none";

		if (this.selectedCoderTab() === "code-tab") {
			switch (this.selectedEditorTab()) {
				case "scene-code":
					SourceCode.instance.render(this.engine.currentScene);
					break;
				case "config":
					SourceCode.instance.render(getData().generated.game);
					break;
				case "assets":
					const { imagedata, videos, } = this.engine.data.generated;
					const sceneName = this.engine.currentScene.name;
					const  assets = [], videoArray = [];
					for (let id in imagedata.sprites) {
						if (imagedata.sprites[id].scenes.indexOf(sceneName) >= 0) {
							assets.push(id);
						}
					}

					for (let id in videos) {
						if  (videos[id].scenes.indexOf(sceneName) >= 0) {
							videoArray.push(id);
						}
					}
					this.renderAssets(assets, videoArray);
					break;
			}
		} else if (this.selectedCoderTab().id === "design-tab") {

		}

		document.querySelector('#scene-code').innerText = `scenes/${this.engine.currentScene.name}/start.js`;
		document.querySelector('#assets').innerText = `scenes/${this.engine.currentScene.name}/assets`;
	}

	static formatCode(obj) {
		return SourceCode.instance.formatCode(obj);
	}

 	formatCode(obj) {
 		switch(typeof(obj)) {
 			case "function":
 				return obj.toString();
			case "string":
				return JSON.stringify(obj);
			case "object":
				if (obj.toSourceCode) {
					return obj.toSourceCode(this);
				}
				break;
			case "number":
				if (obj % 1 === 0 && obj >= 10) {
					return `${JSON.stringify(obj)} /*0x${obj.toString(16)}*/`;
				} else {
					return JSON.stringify(obj);
				}
				break;
			default:
				return `${obj}`;
 		}

 		const isArray = Array.isArray(obj);
 		const result = isArray ? [] : {};
 		if (isArray) {
 			const subValues = obj.map((value, index) => `${this.formatCode(value)}\n`).join(",");
 			return `[ ${subValues} ]`;
 		} else {
 			let subValues = "";
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			subValues += `${Tools.isVarName(o)?o:`"${o}"`}: ${this.formatCode(obj[o])},\n`;
	 			}
	 		}
	 		return `{ ${subValues} }`;
 		}
 	}

	render(config) {
		const sourceCode = document.getElementById("source-code");
		sourceCode.innerHTML = Tools.highlight("javascript", Tools.beautify(this.formatCode(config), {"wrap_line_length": 100}), true).value;
		sourceCode.style.display = "";
	}

	renderAssets(assets, videos) {
		const { sprites } = this.engine.data.generated.imagedata;
		const assetsContainer = document.querySelector("#assets-container");
		assetsContainer.style.display = "";
		assetsContainer.innerHTML = "";
		assetsContainer.style.display = "flex";
		assetsContainer.style.flexWrap = "wrap";
		assets.forEach(id => {
			const { rect, index } = this.engine.data.generated.imagedata.sprites[id];
			const [ x, y, width, height ] = rect;
			const size = 160;
			const scale = Math.min(size / width, size / height);

			const container = assetsContainer.appendChild(document.createElement("div"));
			container.style.margin = "5px";

			const div = container.appendChild(document.createElement("div"));
			div.style.width = "80px"; div.style.height = "80px";
			div.style.border = "1px solid #aaaaaa";
			div.style.padding = "4px";

			const canvas = div.appendChild(document.createElement("canvas"));
			canvas.style.width = "100%"; canvas.style.height = "100%";
			canvas.width = size; canvas.height = size;

			const context = canvas.getContext("2d");
			const image = new Image();
			image.src = `generated/spritesheets/sheet${index}.png`;
			image.addEventListener("load", e => {
				context.drawImage(image, x, y, width, height, 0, 0, width * scale, height * scale);
			});

			const label = container.appendChild(document.createElement("div"));
			label.style.fontSize = "8pt";
			label.style.fontFamily = "Courier New";
			label.style.marginBottom = "10px";
			label.style.textAlign = "center";
			label.style.backgroundColor = "#333333";
			label.innerText = id;
		});
		videos.forEach(vid => {
			if (!this.engine.data.generated.videos[vid]) {
				return;
			}
			const { id, path } = this.engine.data.generated.videos[vid];
			const div = assetsContainer.appendChild(document.createElement("div"));
			div.style.margin = "5px";

			const container = div.appendChild(document.createElement("div"));
			container.style.border = "1px solid #aaaaaa";
			container.style.width = "80px";
			container.style.height = "80px";
			container.style.padding = "4px";
			container.style.display = "flex";
			container.style.justifyContent = "center";
			container.style.alignItems = "center";

			const size = 160;
			if (!this.videos[vid]) {
				const video = container.appendChild(document.createElement("video"));
				video.addEventListener("canplay", e => {
					const { videoWidth, videoHeight } = video;
					const scale = Math.min(size / videoWidth, size / videoHeight);
					video.style.width = `${scale * videoWidth / 2}px`;
					video.style.height = `${scale * videoHeight / 2}px`;
					video.volume = 0;
					video.play();
				});
				video.id = id;
				video.src = path;
				this.videos[vid] = video;
			} else {
				container.appendChild(this.videos[vid]);
				this.videos[vid].play();
			}

			const label = div.appendChild(document.createElement("div"));
			label.style.fontSize = "8pt";
			label.style.fontFamily = "Courier New";
			label.style.marginBottom = "10px";
			label.style.textAlign = "center";
			label.style.backgroundColor = "#333333";
			label.innerText = id;
		});
	}
}

SourceCode.instance = new SourceCode(engine);