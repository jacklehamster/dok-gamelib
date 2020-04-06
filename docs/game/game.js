/**
 *	Game
 */

class Game {
	constructor() {
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

	getFont(fontName) {
		return this.engine.data.generated.config.fonts[fontName];
	}

	getLetterInfo(letter, fontName) {
		const { fonts } = this.engine.data.generated.config;
		if (!fontName) {
			for (let f in fonts) {
				fontName = f;
				break;
			}
		}
		return fontName ? fonts[fontName].letterInfo[letter] : null;
	}
}