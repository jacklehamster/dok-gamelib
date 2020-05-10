/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	IMediaManager
 */

class IMediaManager {
	constructor(config) {
		this.videos = {};
		this.sounds = {};
		this.config = config;
		this.theme = null;
		this.videoPlaytimes = {};
		this.playingVideos = [];
	}


	setTheme(name, volume) {
		if (this.theme !== name) {
			const previousMusic = this.theme;
			if (previousMusic) {
				this.pauseMusic(previousMusic);
			}
			this.theme = name;
			if (this.theme) {
				this.playMusic(this.theme, !previousMusic);
			}
		}

		if (this.theme) {
			this.setMusicVolume(this.theme, volume);
		}
	}

	updatePlayingVideos(sprites, now) {
		const { videoPlaytimes, playingVideos, config } = this;
		for (let i = 0; i < sprites.length; i++) {
			const { src, hidden } = sprites[i];
			if (config.videos[src] && !hidden) {
				if (!videoPlaytimes[src]) {
					this.playVideo(src);
				}
				videoPlaytimes[src] = now;
			}
		}

		for (let i = playingVideos.length - 1; i >= 0; i--) {
			const src = playingVideos[i];
			if (videoPlaytimes[src] !== now) {
				delete videoPlaytimes[src];
				this.pauseVideo(src);
			}
		}
	}

	playMusic(id, reset, url) {
		throw new Error("This function needs to be overwritten.");
	}

	playVideo(id, reset, url) {
		const { playingVideos } = this;
		playingVideos.push(id);
	}

	setMusicVolume(id, volume) {
		throw new Error("This function needs to be overwritten.");
	}

	pauseVideo(id) {
		const { playingVideos } = this;
		const i = playingVideos.indexOf(id);
		if (i >= 0) {
			playingVideos[i] = playingVideos[playingVideos.length-1];
			playingVideos.pop();
		}
	}

	pauseMusic(id) {
		throw new Error("This function needs to be overwritten.");
	}
}