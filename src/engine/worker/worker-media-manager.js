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
	constructor(communicator, config) {
		super(config);
		this.communicator = communicator;
	}

	playMusic(id, reset, url) {
		this.communicator.sendCommand(Commands.MEDIA_PLAY_MUSIC, id, reset, url);
	}

	playVideo(id, reset, url) {
		super.playVideo(id, reset, url);
		this.communicator.sendCommand(Commands.MEDIA_PLAY_VIDEO, id, reset, url);
	}

	setMusicVolume(id, volume) {
		this.communicator.sendCommand(Commands.MEDIA_SET_MUSIC_VOLUME, id, volume);
	}

	pauseVideo(id) {
		super.pauseVideo(id);
		this.communicator.sendCommand(Commands.MEDIA_PAUSE_VIDEO, id);
	}

	pauseMusic(id) {
		this.communicator.sendCommand(Commands.MEDIA_PAUSE_MUSIC, id);
	}
}