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
		this.videoPlaytimes = {};
		this.playingVideos = [];
	}

	updatePlayingVideos(sprites, now) {
		const { videoPlaytimes, playingVideos } = this;
		for (let i = 0; i < sprites.length; i++) {
			const { src, isVideoSprite, hidden } = sprites[i];
			if (isVideoSprite && !hidden) {
				if (!videoPlaytimes[src]) {
					const video = this.getVideo(src);
					if (video) {
						console.log("Play video:", src);
						video.play();
						playingVideos.push(src);
					} else {
						continue;
					}
				}
				videoPlaytimes[src] = now;
			}
		}

		for (let i = playingVideos.length - 1; i >= 0; i--) {
			const src = playingVideos[i];
			if (videoPlaytimes[src] !== now) {
				delete videoPlaytimes[src];
				const video = this.getVideo(src);
				if (video) {
					video.pause();
					console.log("Pause video:", src);
					playingVideos[i] = playingVideos[playingVideos.length-1];
					playingVideos.pop();
				}
			}
		}
		return playingVideos;
	}

	setTheme(name, volume) {
		if (this.theme !== name) {
			const previousMusic = this.theme ? this.getMusic(this.theme) : null;
			if (previousMusic) {
				previousMusic.pause();
			}
			this.theme = name;
			if (this.theme) {
				const music = this.getMusic(this.theme);
				if (music) {
					if (previousMusic) {
						music.currentTime = 0;
					}
					music.loop = "loop";
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
		return this.getSound(name, url);
	}

	getSound(name, url) {
		const { config, sounds } = this;
		if (sounds[name] || config.sounds[name] || url) {
			if (!sounds[name]) {
				const sound = sounds[name] = document.createElement("audio");
				sound.src = url || config.sounds[name].path;
				sound.preload = 'auto';
				sound.addEventListener('canplay', () => {
					sound.ready = true;
				}, true);
			}
			return sounds[name];
		}
		return null;
	}

	playSound(name, url) {
		this.getSound(name, url).play();
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
				video.volume = 0;
				video.addEventListener('canplay', () => {
					video.ready = true;
				}, true);
			}
			return videos[name];
		}
		return null;
	}
}