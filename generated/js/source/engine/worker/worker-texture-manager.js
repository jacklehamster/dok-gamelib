/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class WorkerTextureManager {
	constructor() {
		this.videoDimensions = {};
	}

	updateVideoDimension(src, rect) {
		this.videoDimensions[src] = {
			rect, isVideo: true,
		};
	}

	getVideoTexture(src) {
		return this.videoDimensions[src];
	}
}