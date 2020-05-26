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

		const bufferInfo = {};


		bufferInfo.spriteType = new EngineBuffer(this.shader,
				BufferType.SPRITE_TYPE,
				"spriteType",
				 SPRITE_TYPE_BYTE_PER_VERTEX, gl.BYTE, false, 0, 0, gl.STATIC_DRAW);

		bufferInfo.vertex = new EngineBuffer(this.shader,
				BufferType.VERTEX,
				"vertex",
				FLOAT_PER_VERTEX, gl.FLOAT, false, 24, 0, gl.DYNAMIC_DRAW);
		bufferInfo.normal = new EngineBuffer(this.shader,
				BufferType.NORMAL,
				"normal",
				NORMAL_FLOAT_PER_VERTEX, gl.FLOAT, false, 24, 12, gl.DYNAMIC_DRAW, bufferInfo.vertex.shaderBuffer);

		bufferInfo.offset = new EngineBuffer(this.shader,
				BufferType.OFFSET,
				"offset",
				FLOAT_PER_VERTEX, gl.FLOAT, false, 0, 0, gl.DYNAMIC_DRAW);

		bufferInfo.move = new EngineBuffer(this.shader,
				BufferType.MOVE,
				"move",
				MOVE_FLOAT_PER_VERTEX, gl.FLOAT, false, 28, 0, gl.STREAM_DRAW);
		bufferInfo.gravity = new EngineBuffer(this.shader,				
				BufferType.GRAVITY,
				"gravity",
				GRAVITY_FLOAT_PER_VERTEX, gl.FLOAT, false, 28, 16, gl.STREAM_DRAW, bufferInfo.move.shaderBuffer);

		bufferInfo.texCoord = new EngineBuffer(this.shader,
				BufferType.TEXCOORD,
				"texCoord",
				TEXTURE_FLOAT_PER_VERTEX, gl.FLOAT, false, 32, 0, gl.STREAM_DRAW);
		bufferInfo.texCenter = new EngineBuffer(this.shader,
				BufferType.TEXCENTER,
				"texCenter",
				TEXTURE_CENTER_PER_VERTEX, gl.FLOAT, false, 32, 16, gl.STREAM_DRAW, bufferInfo.texCoord.shaderBuffer);

		bufferInfo.animation = new EngineBuffer(this.shader,
				BufferType.ANIMATION,
				"animation",
				ANIMATION_FLOAT_PER_VERTEX, gl.FLOAT, false, 0, 0, gl.STREAM_DRAW);
		bufferInfo.grid = new EngineBuffer(this.shader,
				BufferType.GRID,
				"grid",
				GRID_FLOAT_PER_VERTEX, gl.UNSIGNED_SHORT, false, 0, 0, gl.STATIC_DRAW);
		bufferInfo.colorEffect = new EngineBuffer(this.shader,
				BufferType.COLOR_EFFECT,
				"colorEffect",
				TINT_FLOAT_PER_VERTEX, gl.FLOAT, false, 0, 0, gl.STREAM_DRAW);

		bufferInfo.blackholeCenter = new EngineBuffer(this.shader,
				BufferType.BLACKHOLE_CENTER,
				"blackholeCenter",
				BLACKHOLE_CENTER_FLOAT_PER_VERTEX, gl.FLOAT, false, 20, 0, gl.STREAM_DRAW);
		bufferInfo.blackholeInfo = new EngineBuffer(this.shader,
				BufferType.BLACKHOLE_INFO,
				"blackholeInfo",
				BLACKHOLE_INFO_FLOAT_PER_VERTEX, gl.FLOAT, false, 20, 12, gl.STREAM_DRAW, bufferInfo.blackholeCenter.shaderBuffer);

		bufferInfo.chromaKey = new EngineBuffer(this.shader,
				BufferType.CHROMA_KEY,
				"chromaKey",
				CHROMA_KEY_FLOAT_PER_VERTEX, gl.FLOAT, false, 0, 0, gl.STREAM_DRAW);

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
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, buffer);
	}

	draw(now) {
		const { gl, shader } = this;
		gl.uniform1f(shader.programInfo.now, now);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, this.visibleChunks * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_INT, 0);
	}
}
