/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
 *	TextureManager
 */

class TextureManager {
	constructor(gl, shader, mediaManager) {
		this.gl = gl;
		this.glTextures = [];
		this.videoTextures = {};
		this.mediaManager = mediaManager;
		this.videoTextureIndex = this.glTextures.length - 1;

		const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

		gl.uniform1iv(shader.programInfo.textures, new Array(maxTextureUnits).fill(null).map((a, index) => index));
		this.glTextures = new Array(maxTextureUnits).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			const width = 1, height = 1;
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			return { glTexture, isVideo: false, width, height };
		});
	}

	setImage(index, image, x, y) {
		const { gl, glTextures } = this;
		const { glTexture, width, height } = glTextures[index];
		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		if (width < TEXTURE_SIZE || height < TEXTURE_SIZE) {
			glTextures[index].width = glTextures[index].height = TEXTURE_SIZE;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTextures[index].width, glTextures[index].height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	getCurrentVideoTextureIndex() {
		const { glTextures } = this;
		return glTextures.length - 1;
	}

	getVideoTexture(src) {
		if (!this.videoTextures[src] && this.mediaManager.getVideo(src)) {
			const { videoWidth, videoHeight } = this.mediaManager.getVideo(src);
			if (videoWidth && videoHeight) {
				this.videoTextures[src] = {
					rect: [0, 0, videoWidth, videoHeight],
					isVideo: true,
				};
			}
		}
		return this.videoTextures[src];
	}

	updateVideoTexture(src) {
		const videoFrame = game.getVideo(src);
		if (!videoFrame || !videoFrame.videoWidth || !videoFrame.videoHeight) {
			return;
		}
		const { gl, glTextures } = this;
		const videoInfo = this.getVideoTexture(src);
		if (!videoInfo) {
			return;
		}
		const index = this.getCurrentVideoTextureIndex();

		const { rect: [ x, y ] } = videoInfo;

		const { glTexture, isVideo, width, height } = glTextures[index];

		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		if (width < TEXTURE_SIZE || height < TEXTURE_SIZE) {
			glTextures[index].width = glTextures[index].height = TEXTURE_SIZE;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, glTextures[index].width, glTextures[index].height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		}
		if (!isVideo) {
			glTextures[index].isVideo = true;
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		if (videoFrame.videoWidth && videoFrame.videoHeight && videoFrame.ready) {
			gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGB, gl.UNSIGNED_BYTE, videoFrame);
		}
	}
}