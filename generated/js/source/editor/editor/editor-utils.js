/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class EditorUtils {
	static formatCode(obj, beautify) {
		const code = EditorUtils.formatCodeHelper(obj);
		return beautify ? Tools.beautify(code, {"wrap_line_length": 100}) : code;
	}

	static codeToBlob(obj) {
		const code = EditorUtils.formatCodeHelper(obj);
		return URL.createObjectURL( new Blob([code], {type: 'application/javascript'}));
	}

 	static formatCodeHelper(obj) {
 		switch(typeof(obj)) {
 			case "function":
 				return obj.toString();
			case "string":
				return JSON.stringify(obj);
			case "object":
				if (obj.toSourceCode) {
					return obj.toSourceCode();
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
 			const subValues = obj.map((value, index) => `${EditorUtils.formatCodeHelper(value)}\n`).join(",");
 			return `[ ${subValues} ]`;
 		} else {
 			let subValues = "";
	 		for (let o in obj) {
	 			if (obj.hasOwnProperty(o)) {
		 			subValues += `${Tools.isVarName(o)?o:`"${o}"`}: ${EditorUtils.formatCodeHelper(obj[o],)},\n`;
	 			}
	 		}
	 		return `{ ${subValues} }`;
 		}
 	}
}