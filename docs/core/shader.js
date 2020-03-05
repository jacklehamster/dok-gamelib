/**
 *	Shader
 */

class Shader {

	constructor(gl, vertexShader, fragmentShader, bufferInfo) {
		const shaderConfig = {
			attributes: {
				vertex: "aVertexPosition",
				offset: "aOffset",
				move: "aVertexMove",
				gravity: "aVertexGravity",
				spriteType: "aType",
				texCoord: "aVertexTextureCoord",
				animation: "aAnimationData",
				grid: "aGrid",
			},
			uniforms: {
				projection: "uProjectionMatrix",
				view: "uViewMatrix",
				now: "uNow",
				camRotation: "uCameraRotation",
				curvature: "uCurvature",
				background: "uBackground",
				textures: "uTextures",
			},
		};

		const shaderProgram = Shader.initShaderProgram(gl, vertexShader, fragmentShader, shaderConfig.attributes);
		const programInfo = Shader.getProgramInfo(gl, shaderProgram, shaderConfig);
		
		this.programInfo = programInfo;

		//	initialize buffers
		this.indexBuffer = Shader.initializeIndexBuffer(gl);
		for (let b in bufferInfo) {
			const engineBuffer = bufferInfo[b];
			engineBuffer.setShaderBuffer(Shader.initializeVertexBuffer(gl, programInfo[b], engineBuffer.floatPerVertex));
		}

		this.gl = gl;
		this.shaderProgram = shaderProgram;

		this.use();
	}

	use() {
		const { shaderProgram, gl } = this;
		gl.useProgram(shaderProgram);		
	}

	static initShaderProgram(gl, vsSource, fsSource, attributes) {
		const vertexShader = Shader.loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = Shader.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
		if (!vertexShader || !fragmentShader) {
			return null;
		}
  
		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);

		let count = 0;
		for (let a in attributes) {
			gl.bindAttribLocation(shaderProgram, count ++, attributes[a]);
		}

		gl.linkProgram(shaderProgram);
  
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		  console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		  return null;
		}
  
		return shaderProgram;
	}
    
	static loadShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
  
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		  console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		  gl.deleteShader(shader);
		  return null;
		}
		return shader;
	}

	static getProgramInfo(gl, shaderProgram, { attributes, uniforms }) {
		const programInfo = {};
		for (let a in attributes) {
			programInfo[a] = gl.getAttribLocation(shaderProgram, attributes[a]);
		}
		for (let u in uniforms) {
			programInfo[u] = gl.getUniformLocation(shaderProgram, uniforms[u]);
		}
		return programInfo;
	}	

	static initializeVertexBuffer(gl, location, floatsPerVertex) {
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.vertexAttribPointer(location, floatsPerVertex, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(location);
		gl.bufferData(gl.ARRAY_BUFFER, floatsPerVertex * MAX_SPRITE * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
		return vertexBuffer;
	}

	static initializeIndexBuffer(gl) {
		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, MAX_SPRITE * INDEX_ARRAY_PER_SPRITE.length * Uint16Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
		for (let i = 0; i < MAX_SPRITE; i++) {
			const slotIndices = INDEX_ARRAY_PER_SPRITE.map(value => value + i * VERTICES_PER_SPRITE);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, i * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);
		}
		return indexBuffer;	
	}
}