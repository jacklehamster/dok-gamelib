/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	WorkerMediaManager
 */

class WorkerMediaManager extends IMediaManager {
	constructor(engine, config) {
		super(config);
		this.engine = engine;
	}

	playMusic(id, reset, url) {
        this.engine.sendCommand("mediaManager", "playMusic", id, reset, url);
	}

	playVideo(id, reset, url) {
        this.engine.sendCommand("mediaManager", "playVideo", id, reset, url);
	}

	setMusicVolume(id, volume) {
        this.engine.sendCommand("mediaManager", "setMusicVolume", id, volume);
	}

	pauseVideo(id) {
        this.engine.sendCommand("mediaManager", "pauseVideo", id);
	}

	pauseMusic(id) {
        this.engine.sendCommand("mediaManager", "pauseMusic", id);
	}
}