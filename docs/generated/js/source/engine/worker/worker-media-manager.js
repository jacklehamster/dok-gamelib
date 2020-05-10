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
	constructor(engineCommunicator, config) {
		super(config);
		this.engineCommunicator = engineCommunicator;
	}

	playMusic(id, reset, url) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_PLAY_MUSIC, [reset?1:0], [id, url||null]);
	}

	playVideo(id, reset, url) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_PLAY_VIDEO, [reset?1:0], [id, url||null]);
	}

	setMusicVolume(id, volume) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_SET_MUSIC_VOLUME, [volume], [id]);
	}

	pauseVideo(id) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_PAUSE_VIDEO, null, [id]);
	}

	pauseMusic(id) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_PAUSE_MUSIC, null, [id]);
	}
}