/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/*
	SpritesheetManager
*/

class SpritesheetManager {
	constructor({imagedata, game}) {
		this.images = null;

		//	load texture
		Utils.load(imagedata.spritesheets.map(({url}) => url), {
			error: errors => {
				this.onErrorListeners.forEach(callback => callback(errors));
				this.onLoadListeners.length = 0;
				this.onErrorListeners.length = 0;
				this.onProgressListeners.length = 0;
			},
			progress: progress => {
				this.progress = progress;
				this.onProgressListeners.forEach(callback => callback(this.progress));
			},
			complete: images => {
				this.images = images;
				this.progress = 1;
				this.onLoadListeners.forEach(callback => callback(this.images));
				this.onLoadListeners.length = 0;
				this.onErrorListeners.length = 0;
				this.onProgressListeners.length = 0;
			},
		});

		this.lastRefresh = 0;
		this.progress = 0;
		this.onLoadListeners = [];
		this.onErrorListeners = [];
		this.onProgressListeners = [];
	}

	get loaded() {
		return this.images !== null;
	}

	fetchImages(progressListener, callbackListener, errorListener) {
		if (this.images) {
			callbackListener(this.images);
		} else {
			if (progressListener && typeof(progressListener) === "function") {
				this.onProgressListeners.push(progressListener);
			}
			this.onLoadListeners.push(images => callbackListener(images));
			this.onErrorListeners.push(errors => errorListener(errors));
		}
	}
}