class SourceCode {
	constructor(engine) {
		this.engine = engine;
		engine.addEventListener("sceneChange", ({config}) => {
			this.refreshView();
		});

		engine.addEventListener("start", engine => {
			const config = document.getElementById("config");
			const sceneCode = document.getElementById("scene-code");
			sceneCode.addEventListener("click", () => {
				this.selectTab("scene-code");
				SourceCode.instance.render(game.config);
			});
			config.addEventListener("click", () => {
				this.selectTab("config");
				SourceCode.instance.render(getData().generated.config.game);
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
				SourceCode.instance.render(this.engine.currentScene.config);
				break;
			case "config":
				SourceCode.instance.render(getData().generated.config.game);
				break;
		}
	}

 	formatCode(obj) {
 		if (typeof(obj) !== 'object') {
 			if (typeof(obj) === "function") {
 				return obj.toString();
 			} else {
 				return typeof(obj) === 'string' ? `"${obj}"` : `${obj}`;
 			}
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