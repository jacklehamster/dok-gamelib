/**
 *	Game
 */

class Game {
	constructor() {
		this.now = 0;
		this.startTime = 0;
		this.lastRefresh = 0;
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
		return this.engine.keyboard.getKeyboard(this.now);		
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
		const { fonts } = this.engine.data.generated.config;
		for (let f in fonts) {
			return f;
		}
		return null;
	}

	getFont(fontName) {
		return this.engine.data.generated.config.fonts[fontName || this.getFirstFontName()];
	}

	getLetterInfo(letter, fontName) {
		const font = this.getFont(fontName);
		return font ? font.letterInfo[letter] : null;
	}
}