/**
 *	Game
 */

class Game {
	constructor() {
		this.now = 0;
		this.startTime = 0;
		this.lastRefresh = 0;
		this.lastKeys = 0;
		this.keysCache = null;
		this.classes = { Game, SpriteDefinition };
		this.config = {};
	}

	setEngine(value) {
		this.engine = value;
		this.videoManager = this.engine.videoManager;
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

	gotoScene(name) {
		this.engine.resetScene(name);
	}

	getFrameRate() {
		return this.settings.frameRate.get();
	}

	getVideo(name) {
		return this.videoManager.getVideo(name);
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

	getLetterInfo(letter, fontName) {
		const font = this.getFont(fontName);
		return font ? font.letterInfo[letter] : null;
	}

	toSourceCode(editor) {
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