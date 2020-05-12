/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/*
GLRenderer Engine


*/

class GLRenderer extends ISpriteRenderer {
	constructor(gl, textureManager, webgl, engineCommunicator, spriteProvider, spriteDataProcessor, configData) {
		super(textureManager, engineCommunicator, spriteProvider, spriteDataProcessor, configData);

		this.gl = gl;
		const { vertexShader, fragmentShader } = webgl;
		this.shader = new Shader(this.gl, vertexShader, fragmentShader);

		const bufferInfo = {
			spriteType: 	new EngineBuffer(BufferType.SPRITE_TYPE, 		this.shader, "spriteType", SPRITE_TYPE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			vertex: 		new EngineBuffer(BufferType.VERTEX, 			this.shader, "vertex", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			offset: 		new EngineBuffer(BufferType.OFFSET, 			this.shader, "offset", FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			normal: 		new EngineBuffer(BufferType.NORMAL, 			this.shader, "normal", NORMAL_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			move: 			new EngineBuffer(BufferType.MOVE, 				this.shader, "move", MOVE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			gravity: 		new EngineBuffer(BufferType.GRAVITY, 			this.shader, "gravity", GRAVITY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCoord: 		new EngineBuffer(BufferType.TEXCOORD, 			this.shader, "texCoord", TEXTURE_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			texCenter: 		new EngineBuffer(BufferType.TEXCENTER, 			this.shader, "texCenter", TEXTURE_CENTER_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			animation: 		new EngineBuffer(BufferType.ANIMATION, 			this.shader, "animation", ANIMATION_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			grid: 			new EngineBuffer(BufferType.GRID, 				this.shader, "grid", GRID_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			colorEffect: 	new EngineBuffer(BufferType.COLOR_EFFECT, 		this.shader, "colorEffect", TINT_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeCenter: new EngineBuffer(BufferType.BLACKHOLE_CENTER, 	this.shader, "blackholeCenter", BLACKHOLE_CENTER_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			blackholeInfo:  new EngineBuffer(BufferType.BLACKHOLE_INFO, 	this.shader, "blackholeInfo", BLACKHOLE_INFO_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
			chromaKey: 		new EngineBuffer(BufferType.CHROMA_KEY, 		this.shader, "chromaKey", CHROMA_KEY_FLOAT_PER_VERTEX, VERTICES_PER_SPRITE, MAX_SPRITE, true),
		};

		this.bufferInfos = [];
		for (let i in bufferInfo) {
			this.bufferInfos[bufferInfo[i].type] = bufferInfo[i];
		}

		this.boundBuffer = null;
	}

	bindBuffer(shaderBuffer) {
		if (this.boundBuffer === shaderBuffer) {
			return;
		}
		const { gl } = this;

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);
		this.boundBuffer = shaderBuffer;
	}

	sendBufferToGL(type, offset, buffer) {
		const { gl, bufferInfos } = this;
		if (!bufferInfos[type]) {
			console.error(type, offset);
		}
		this.bindBuffer(bufferInfos[type].shaderBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, buffer);
	}

	draw(now) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.now, now);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, this.visibleChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_INT, 0);
	}
}
