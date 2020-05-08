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
		this.engine = null;
		this.now = 0;
		this.startTime = 0;
		this.lastRefresh = 0;
		this.lastKeys = 0;
		this.lastMouse = 0;
		this.keysCache = null;
		this.mouseCache = null;
		this.nextScene = null;
		this.classes = { Game, SpriteDefinition };
		this.config = {};
		this.definitions = {};
	}

	getDefinition(id) {
		const definition = this.definitions[id];
		if (definition) {
			if (definition.id.get() !== id) {
				delete this.definitions[id];
			} else {
				return definition;
			}
		}
		return null;
	}

	setEngine(value) {
		this.engine = value;
	}

	get data() {
		return this.engine.dataStore.getData();
	}

	get situation() {
		return this.engine.dataStore.getSituation(this.name);
	}

	saveData() {
		this.engine.dataStore.save();
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

	runAfter(delay, action) {
		this.engine.timeScheduler.scheduleAt(this.now + delay, action);
	}

	gotoScene(name) {
		this.nextScene = name;
	}

	getFrameRate() {
		return this.settings.frameRate.get();
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

	unlockMedal(medal) {
		this.engine.unlockMedal(medal);
	}

	sendScore(score) {
		this.engine.sendScore(score);
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