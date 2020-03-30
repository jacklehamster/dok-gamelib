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
		if (config.video[name]) {
			if (!videos[name]) {
				const video = videos[name] = document.createElement("video");
				video.src = config.video[name].path;
				video.crossOrigin = '';
				video.addEventListener('canplay', function(e) {
					console.log(e.type, video.videoWidth);
				}, true);
				video.addEventListener('playing', function(e) {
					console.log(e.type, "playing");
				}, true);
			}
			return videos[name];
		}
		return null;
	}
}