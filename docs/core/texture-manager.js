/**
 *	TextureManager
 */

class TextureManager {
	constructor(gl, shader) {
		this.gl = gl;
		this.glTextures = [];
		gl.uniform1iv(shader.programInfo.textures, new Array(MAX_TEXTURES).fill(null).map((a, index) => index));
		this.glTextures = new Array(MAX_TEXTURES).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			glTexture.width = glTexture.height = 1;
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			return glTexture;
		});
	}

	setImage(index, src, x, y) {
		const { gl, glTextures } = this;
		Utils.load(src).then(image => {
			const glTexture = glTextures[index];
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
				glTexture.width = glTexture.height = TEXTURE_SIZE;
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}
			gl.texSubImage2D(gl.TEXTURE_2D, 0, x || 0, y || 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		});
	}
}