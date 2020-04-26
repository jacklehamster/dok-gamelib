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

class MediaManager {
	constructor(config) {
		this.videos = {};
		this.sounds = {};
		this.config = config;
		this.theme = null;
	}

	setTheme(name, volume) {
		if (this.theme !== name) {
			const previousMusic = this.theme ? this.getMusic(this.theme) : null;
			if (previousMusic) {
				previousMusic.pause();
			}
			if (name) {
				this.theme = name;
				const music = this.getMusic(this.theme);
				if (music) {
					if (previousMusic) {
						music.currentTime = 0;
					}
					music.play();
				}
			}
		}

		if (this.theme) {
			const music = this.getMusic(this.theme);
			if (music) {
				music.volume = volume;
			}
		}
	}

	getMusic(name, url) {
		const { config, sounds } = this;
		if (sounds[name] || config.sounds[name] || url) {
			if (!sounds[name]) {
				const sound = sounds[name] = document.createElement("audio");
				sound.src = url || config.sounds[name].path;
				sound.preload = 'auto';
				sound.loop = "loop";
				sound.addEventListener('canplay', () => {
					sound.ready = true;
				}, true);
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
				video.src = url || config.videos[name].path;
				video.crossOrigin = '';
				video.preload = 'auto';
				video.loop = "loop";
				video.addEventListener('canplay', () => {
					video.ready = true;
				}, true);
			}
			return videos[name];
		}
		return null;
	}
}