/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	VideoManager
 */

class VideoManager {
	constructor(config) {
		this.videos = {};
		this.config = config;
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
				video.addEventListener('canplay', function(e) {
					video.ready = true;
				}, true);
			}
			return videos[name];
		}
		return null;
	}
}