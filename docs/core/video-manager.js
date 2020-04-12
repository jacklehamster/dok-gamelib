/**
 *	VideoManager
 */

class VideoManager {
	constructor(config) {
		this.videos = {};
		this.config = config;
	}

	getVideo(name) {
		const { config, videos } = this;
		if (config.videos[name]) {
			if (!videos[name]) {
				const video = videos[name] = document.createElement("video");
				video.src = config.videos[name].path;
				video.crossOrigin = '';
				video.preload = 'auto';
				video.addEventListener('canplay', function(e) {
					video.ready = true;
				}, true);
			}
			return videos[name];
		}
		return null;
	}
}