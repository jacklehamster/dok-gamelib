const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
const MOVE_FLOAT_PER_VERTEX 	= 4;	//	x,y,z,time
const TEXTURE_FLOAT_PER_VERTEX 	= 4;	//	x,y,w,h
const ANIMATION_FLOAT_DATA 		= 4;	//	cols,index,count,frameRate
const VERTICES_PER_SPRITE 		= 4;	//	4 corners
const INDEX_ARRAY_PER_SPRITE = new Uint16Array([
	0,  1,  2,
	0,  2,  3,
]);

const MAX_TEXTURES = 16;
const MAX_SPRITE = 1000;


class Shader {

	constructor(gl, vertexShader, fragmentShader) {
		const shaderProgram = Shader.initShaderProgram(gl, vertexShader, fragmentShader);
		gl.useProgram(shaderProgram);
		const programInfo = Shader.getProgramInfo(gl, shaderProgram);
		
		this.programInfo = programInfo;
		//	initialize buffers
		this.buffer = {
			vertex: Shader.initializeVertexBuffer(gl, programInfo.vertexLocation, FLOAT_PER_VERTEX),
			move: Shader.initializeVertexBuffer(gl, programInfo.vertexMove, MOVE_FLOAT_PER_VERTEX),
			texCoord: Shader.initializeVertexBuffer(gl, programInfo.vertexTextureCoord, TEXTURE_FLOAT_PER_VERTEX),
			animation: Shader.initializeVertexBuffer(gl, programInfo.animationData, ANIMATION_FLOAT_DATA),
			index: Shader.initializeIndexBuffer(gl),
		};
	}

	static initShaderProgram(gl, vsSource, fsSource) {
		const vertexShader = Shader.loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = Shader.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
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

	static getProgramInfo(gl, shaderProgram) {
		const programInfo = {
			vertexLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexMove: gl.getAttribLocation(shaderProgram, 'aVertexMove'),
			vertexTextureCoord: gl.getAttribLocation(shaderProgram, 'aVertexTextureCoord'),
			animationData: gl.getAttribLocation(shaderProgram, 'aAnimationData'),

			projectionLocation: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			viewLocation: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
			nowLocation: gl.getUniformLocation(shaderProgram, 'uNowSec'),
			textures: gl.getUniformLocation(shaderProgram, 'uTextures'),
			gravity: gl.getUniformLocation(shaderProgram, 'uGravity'),
		};
		return programInfo;
	}	

	static initializeVertexBuffer(gl, location, floatsPerVertex) {
		const vertexBuffer = Shader.createVertexAttributeBuffer(gl, location, floatsPerVertex);
		Shader.resizeBuffer(gl, gl.ARRAY_BUFFER, vertexBuffer, floatsPerVertex * MAX_SPRITE * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);
		return vertexBuffer;
	}

	static createVertexAttributeBuffer(gl, location, numComponents) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.vertexAttribPointer(location, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(location);
		return buffer;
	}

	static initializeIndexBuffer(gl) {
		const indexBuffer = gl.createBuffer();
		Shader.resizeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indexBuffer, MAX_SPRITE * INDEX_ARRAY_PER_SPRITE.length * Uint16Array.BYTES_PER_ELEMENT);
		for (let i = 0; i < MAX_SPRITE; i++) {
			const slotIndices = INDEX_ARRAY_PER_SPRITE.map(value => value + i * VERTICES_PER_SPRITE);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, i * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);
		}
		return indexBuffer;	
	}

	static resizeBuffer(gl, bufferType, buffer, newBufferSize) {
		gl.bindBuffer(bufferType, buffer);
		const bufferSize = gl.getBufferParameter(bufferType, gl.BUFFER_SIZE);
		gl.bufferData(bufferType, newBufferSize, gl.STATIC_DRAW);
		return buffer;
	}
}