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
		this.engineCommunicator.sendCommandInt(Commands.MEDIA_PLAY_MUSIC);
		this.engineCommunicator.loadExtra([id]);
		this.engineCommunicator.communicator.payload.writeUnsignedByte(reset ? 1 : 0);
		this.engineCommunicator.loadExtra([url||null]);
	}

	playVideo(id, reset, url) {
		super.playVideo(id, reset, url);
		this.engineCommunicator.sendCommandInt(Commands.MEDIA_PLAY_VIDEO);
		this.engineCommunicator.loadExtra([id]);
		this.engineCommunicator.communicator.payload.writeUnsignedByte(reset ? 1 : 0);
		this.engineCommunicator.loadExtra([url||null]);
	}

	setMusicVolume(id, volume) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_SET_MUSIC_VOLUME, [volume], [id]);
	}

	pauseVideo(id) {
		super.pauseVideo(id);
		this.engineCommunicator.sendCommand(Commands.MEDIA_PAUSE_VIDEO, null, [id]);
	}

	pauseMusic(id) {
		this.engineCommunicator.sendCommand(Commands.MEDIA_PAUSE_MUSIC, null, [id]);
	}
}