class Texture {
	static getGLtextures(gl, shader) {
		gl.uniform1iv(shader.programInfo.textures, new Array(16).fill(null).map((a, index) => index));
		const textures = new Array(MAX_TEXTURES).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			glTexture.width = glTexture.height = 1;
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			return glTexture;
		});
		return textures;
	}
}