/**
 *	TextureManager
 */

class TextureManager {
	constructor(gl, shader) {
		this.gl = gl;
		this.glTextures = [];
		this.videoTextures = {};

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

	getVideoTexture(src) {
		if (!this.videoTextures[src]) {
			this.videoTextures[src] = {
				offset: [0, 0],
				size: [640, 640],
				grid: [1, 1],
				index: this.glTextures.length - 1,
			};
		}
		return this.videoTextures[src];
	}

	updateVideoTexture(videoFrame, index, x, y) {
		const { gl, glTextures } = this;
		const { glTexture, isVideo, width, height } = glTextures[index];
		gl.activeTexture(gl[`TEXTURE${index}`]);
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		if (width < TEXTURE_SIZE || height < TEXTURE_SIZE) {
			glTextures[index].width = glTextures[index].height = TEXTURE_SIZE;
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTextures[index].width, glTextures[index].height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		if (!isVideo) {
			glTextures[index].isVideo = true;
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		if (videoFrame.videoWidth && videoFrame.videoHeight && videoFrame.ready) {
			gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGBA, gl.UNSIGNED_BYTE, videoFrame);
		}
	}
}