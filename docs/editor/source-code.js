class SourceCode {
	constructor(engine) {
		engine.addEventListener("sceneChange", ({config}) => {
			this.render(config);
		});
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
		 			subValues += `${o}: ${this.formatCode(obj[o])},\n`;
	 			}
	 		}
	 		return `{ ${subValues} }`;
 		}
 	}

	render(config) {
		const sourceCode = document.getElementById("source-code");
		sourceCode.innerHTML = Tools.highlight("javascript", Tools.beautify(this.formatCode(config)), true).value;
	}
}

SourceCode.instance = new SourceCode(engine);