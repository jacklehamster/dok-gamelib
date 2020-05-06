/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
	DOMManager 
*/

class DOMManager {
	constructor(document) {
		this.document = document;
	}

	setBackgroundColor(color) {
		this.document.body.style.backgroundColor = Utils.getDOMColor(color);		
	}
}