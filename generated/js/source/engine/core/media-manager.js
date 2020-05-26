/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	MediaManager
 */

class MediaManager extends IMediaManager {
	constructor(config) {
		super(config);
	}

	playMusic(id, reset, url) {
		const music = this.getMusic(id, url);
		if (music) {
			music.loop = "loop";
			if (reset) {
				music.currentTime = 0;
			}
			music.play();
		}
	}

	playVideo(id, reset, url) {
		super.playVideo(id, reset, url);
		const video = this.getVideo(id, url);
		if (video) {
			if (reset) {
				video.currentTime = 0;
			}
			video.play();
		}
	}

	setMusicVolume(id, volume) {
		const music = this.getMusic(id);
		if (music) {
			music.volume = volume;
		}
	}

	pauseVideo(id) {
		super.pauseVideo(id);
		const video = this.getVideo(id);
		if (video) {
			video.pause();
		}
	}

	pauseMusic(id) {
		const sound = this.getSound(id);
		if (sound) {
			sound.pause();
		}
	}

	getMusic(name, url) {
		return this.getSound(name, url);
	}

	getSound(name, url) {
		const { config, sounds } = this;
		if (sounds[name] || config.sounds[name] || url) {
			if (!sounds[name]) {
				const sound = sounds[name] = document.createElement("audio");
				sound.addEventListener("canplay", e => sound.ready = true);
				sound.src = url || config.sounds[name].path;
				sound.preload = 'auto';
			}
			return sounds[name];
		}
		return null;
	}

	getVideo(name, url) {
		const { config, videos } = this;
		if (videos[name] || config.videos[name] || url) {
			if (!videos[name]) {
				const video = videos[name] = document.createElement("video");
				video.addEventListener("canplay", e => video.ready = true);
				video.src = url || config.videos[name].path;
				video.crossOrigin = '';
				video.preload = 'auto';
				video.loop = "loop";
				video.volume = 0;			
			}
			return videos[name];
		}
		return null;
	}
}