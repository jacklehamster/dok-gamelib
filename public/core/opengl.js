class Engine {
	constructor(canvas, webgl) {
		this.TEXTURE_SIZE = 4096;
		
		canvas.width = canvas.offsetWidth * 2;
		canvas.height = canvas.offsetHeight * 2;
		canvas.style.width = `${canvas.width / 2}px`;
		canvas.style.height = `${canvas.height / 2}px`;

		const { vertexShader, fragmentShader } = webgl;
		this.gl = canvas.getContext("webgl", {antialias:false});
		this.shader = new Shader(this.gl, vertexShader, fragmentShader);
		this.projectionMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.cache = {};

		const { gl, shader, projectionMatrix, viewMatrix, cache, TEXTURE_SIZE } = this;

		//	initialize view and projection
		this.setViewAngle(45);
		this.setPosition(0, 0, 0);

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.vertex);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			-.5, .5, 0,		//	top-left
			-.5, -.5, 0,	//	bottom-left
			.5, -.5, 0,		//	bottom-right
			.5, .5, 0,		//	top-left
		]));

		const nowSec = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
		]));

		//	[ x, y, spritewidth, spriteheight ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.texCoord);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 					0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			0, 					64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
		]));

		//	[ cols, index, total, frameRate ]
		gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffer.animation);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
		]));

		gl.uniform4fv(shader.programInfo.gravity, [0, 0, 0, 0]);

		//	load texture
		this.glTextures = Texture.getGLtextures(gl, shader);
		this.loadTexture(0, "generated/spritesheets/sheet0.png");
		this.setBackground(0x000000);
		this.display(nowSec);
	}

	loadTexture(index, src) {
		const { gl, glTextures, TEXTURE_SIZE } = this;
		Utils.load(src).then(image => {
			const x = 0, y = 0;
			const glTexture = glTextures[index];
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
				glTexture.width = glTexture.height = TEXTURE_SIZE;
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}
			gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		});
	}

	setBackground(color) {
		color = color || 0;
		this.gl.clearColor(((color >> 16) % 256) / 256, ((color >> 8) % 256) / 256, (color % 256) / 256, 1.0);
	}

	setViewAngle(viewAngle) {
		const { gl, shader, projectionMatrix } = this;
		const fieldOfView = (viewAngle||45) * Math.PI / 180;   // in radians
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1, zFar = 1000.0;
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		gl.uniformMatrix4fv(shader.programInfo.projectionLocation, false, projectionMatrix);
	}

	setPosition(x, y, z) {
		const { gl, shader, viewMatrix } = this;
		mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(-x, -y, -z - 2));
		gl.uniformMatrix4fv(shader.programInfo.viewLocation, false, viewMatrix);
	}

	setTime(timeMillis) {
		const { gl, shader } = this;
		const nowSec = timeMillis / 1000;
		gl.uniform1f(shader.programInfo.nowLocation, nowSec);
	}

	clear() {
		const { gl } = this;
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	display() {
		const { gl } = this;
		const INDEX_ARRAY_PER_SPRITE_COUNT = 6;

		gl.drawElements(gl.TRIANGLES, 1 * INDEX_ARRAY_PER_SPRITE_COUNT, gl.UNSIGNED_SHORT, 0);
	}
}
