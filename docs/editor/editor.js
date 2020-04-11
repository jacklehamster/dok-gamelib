class SourceCode {
	constructor(engine) {
		this.engine = engine;
		engine.addEventListener("sceneChange", ({config}) => {
			this.refreshView();
		});

		engine.addEventListener("start", engine => {
			document.getElementById("scene-code").addEventListener("click", () => {
				this.selectTab("scene-code");
				SourceCode.instance.render(game);
			});
			document.getElementById("config").addEventListener("click", () => {
				this.selectTab("config");
				SourceCode.instance.render(getData().generated.game);
			});
			document.getElementById("assets").addEventListener("click", () => {
				this.selectTab("assets");
			});
		});
	}

	selectTab(id) {
		const tabs = document.querySelectorAll("#editor-tabs > .tab");
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab.id === id) {
				tab.classList.add("selected");
			} else {
				tab.classList.remove("selected");
			}
		}
		this.refreshView();
	}

	selectedTab() {
		const tabs = document.querySelectorAll("#editor-tabs > .tab");
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab.classList.contains("selected")) {
				return tab.id;
			}
		}
		return null;
	}

	refreshView() {
		switch (this.selectedTab()) {
			case "scene-code":
				SourceCode.instance.render(this.engine.currentScene);
				break;
			case "config":
				SourceCode.instance.render(getData().generated.game);
				break;
			case "assets":
				const { sprites } = this.engine.data.generated.imagedata;
				const sceneName = this.engine.currentScene.name;
				for (let id in sprites) {
					if (sprites[id].scenes.indexOf(sceneName) >= 0) {
						console.log("+" + id);
					}
				}
				break;
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
	}
}

SourceCode.instance = new SourceCode(engine);