/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	Game
 */

class Game {
	constructor() {
		this.now = 0;
		this.startTime = 0;
		this.lastRefresh = 0;
		this.lastKeys = 0;
		this.lastMouse = 0;
		this.keysCache = null;
		this.mouseCache = null;
		this.classes = { Game, SpriteDefinition };
		this.config = {};
	}

	setEngine(value) {
		this.engine = value;
		this.mediaManager = this.engine.mediaManager;
	}

	get data() {
		return this.dataStore.getData();
	}

	get situation() {
		return this.dataStore.getSituation(this.name);
	}

	get scenes() {
		return this.engine.sceneManager.sceneNames;
	}

	get keys() {
		if (this.lastKeys !== this.now) {
			this.lastKeys = this.now;
			this.keysCache = this.engine.keyboard.getKeyboard(this.now);
		}
		return this.keysCache;
	}

	get mouseStatus() {
		if (this.lastMouse !== this.now) {
			this.lastMouse = this.now;
			this.mouseCache = this.engine.mouse.getMouse(this.now);
		}
		return this.mouseCache;
	}

	gotoScene(name) {
		this.engine.gotoScene(name);
	}

	getFrameRate() {
		return this.settings.frameRate.get();
	}

	getVideo(name, url) {
		return this.mediaManager.getVideo(name, url);
	}

	getMusic(name, url) {
		return this.mediaManager.getMusic(name, url);
	}

	getFirstFontName() {
		const { fonts } = this.engine.data.generated;
		for (let f in fonts) {
			return f;
		}
		return null;
	}

	getFont(fontName) {
		return this.engine.data.generated.fonts[fontName || this.getFirstFontName()];
	}

	toSourceCode(_, editor) {
		const { classes, config } = this;
		const classesParam = {
			... classes,
		};
		if (classesParam.Game === Game) {
			delete classesParam.Game;
		}
		if (classesParam.SpriteDefinition === SpriteDefinition) {
			delete classesParam.SpriteDefinition;
		}
		return `SceneManager.add(${editor.formatCode(classesParam)}, ${editor.formatCode(config)});`;
	}	
}