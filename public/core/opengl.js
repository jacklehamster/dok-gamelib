const engine = (() => {

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
	const TEXTURE_SIZE = 4096;

	let gl;
	let data;
	let programInfo;
	let glTextures;
	let backgroundColor = 0x000000;
	let nowSec = 0;

	let projectionMatrix, viewMatrix;

	const buffer = {}, cache = {};

	function initialize(canvas, gameData) {
		engine.canvas = canvas;
		canvas.width = canvas.offsetWidth * 2;
		canvas.height = canvas.offsetHeight * 2;
		canvas.style.width = `${canvas.width/2}px`;
		canvas.style.height = `${canvas.height/2}px`;

		data = gameData;
		gl = canvas.getContext("webgl", {antialias:false});
		const { vertexShader, fragmentShader } = data.webgl;
		const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);
		gl.useProgram(shaderProgram);
		programInfo = getProgramInfo(gl, shaderProgram);

		//	initialize buffers
		buffer.vertex = initializeVertexBuffer(gl, programInfo.vertexLocation, FLOAT_PER_VERTEX);
		buffer.move = initializeVertexBuffer(gl, programInfo.vertexMove, MOVE_FLOAT_PER_VERTEX);
		buffer.texCoord = initializeVertexBuffer(gl, programInfo.vertexTextureCoord, TEXTURE_FLOAT_PER_VERTEX);
		buffer.animation = initializeVertexBuffer(gl, programInfo.animationData, ANIMATION_FLOAT_DATA);

		buffer.index = gl.createBuffer();
		resizeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, buffer.index, MAX_SPRITE * INDEX_ARRAY_PER_SPRITE.length * Uint16Array.BYTES_PER_ELEMENT);
		for (let i = 0; i < MAX_SPRITE; i++) {
			const slotIndices = INDEX_ARRAY_PER_SPRITE.map(value => value + i * VERTICES_PER_SPRITE);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, i * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);
		}

		//	initialize view and projection
		if (!projectionMatrix) {
			projectionMatrix = mat4.create();
			const fieldOfView = 45 * Math.PI / 180;   // in radians
			const aspect = gl.canvas.width / gl.canvas.height;
			const zNear = 0.1, zFar = 1000.0;
			mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
			gl.uniformMatrix4fv(programInfo.projectionLocation, false, projectionMatrix);
			cache.projectionMatrix = mat4.create();
		}
		if (!mat4.exactEquals(projectionMatrix, cache.projectionMatrix)) {
			gl.uniformMatrix4fv(programInfo.projectionLocation, false, projectionMatrix);
			mat4.copy(cache.projectionMatrix, projectionMatrix);
		}

		if (!viewMatrix) {
			const [ x, y, z ] = vec3.fromValues(0, 0, 2);
			viewMatrix = mat4.create();
			mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(-x, -y, -z));
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			cache.viewMatrix = mat4.create();
		}
		if (!mat4.exactEquals(viewMatrix, cache.viewMatrix)) {
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			mat4.copy(cache.viewMatrix, viewMatrix);
		}

		//	set sprite data
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			-.5, .5, 0,		//	top-left
			-.5, -.5, 0,	//	bottom-left
			.5, -.5, 0,		//	bottom-right
			.5, .5, 0,		//	top-left
		]));

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
			0, 0, 0, nowSec,
		]));

		//	[ x, y, spritewidth, spriteheight ]
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.texCoord);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			0, 					0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			0, 					64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	64/TEXTURE_SIZE,	64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
			64/TEXTURE_SIZE, 	0,					64/TEXTURE_SIZE, 64/TEXTURE_SIZE,
		]));

		//	[ cols, index, total, frameRate ]
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.animation);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from([
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
			4, 0, 8, 4,
		]));

		gl.uniform4fv(programInfo.gravity, [0, 0, 0, 0]);

		//	load texture
		glTextures = getGLtextures(gl);
		Utils.load("generated/spritesheets/sheet0.png").then(image => {
			const index = 0, x = 0, y = 0;
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

		requestAnimationFrame(refresh);
	}

	function initializeVertexBuffer(gl, location, floatsPerVertex) {
		const vertexBuffer = createVertexAttributeBuffer(gl, location, floatsPerVertex);
		resizeBuffer(gl, gl.ARRAY_BUFFER, vertexBuffer, floatsPerVertex * MAX_SPRITE * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);
		return vertexBuffer;
	}

	function refresh(timeMillis) {
		nowSec = timeMillis / 1000;
		gl.clearColor(((backgroundColor >> 16) % 255) / 256, ((backgroundColor >> 8) % 255) / 256, backgroundColor % 256, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(programInfo.nowLocation, nowSec);
		gl.drawElements(gl.TRIANGLES, 1 * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
		requestAnimationFrame(refresh);
	}

	function getGLtextures(gl) {
		gl.uniform1iv(programInfo.textures, new Array(16).fill(null).map((a, index) => index));
		glTextures = new Array(MAX_TEXTURES).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			glTexture.width = glTexture.height = 1;
			gl.activeTexture(gl[`TEXTURE${index}`]);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			return glTexture;
		});
		return glTextures;
	}

	function initShaderProgram(gl, vsSource, fsSource) {
		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
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
    
	function loadShader(gl, type, source) {
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

	function getProgramInfo(gl, shaderProgram) {
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

	function createVertexAttributeBuffer(gl, location, numComponents) {
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

	function resizeBuffer(gl, bufferType, buffer, newBufferSize) {
		gl.bindBuffer(bufferType, buffer);
		const bufferSize = gl.getBufferParameter(bufferType, gl.BUFFER_SIZE);
		gl.bufferData(bufferType, newBufferSize, gl.STATIC_DRAW);
		return buffer;
	}

	const bigFloatArray = new Float32Array(MAX_SPRITE * VERTICES_PER_SPRITE * 4 * Float32Array.BYTES_PER_ELEMENT);

	return {
		initialize,
	};
})();
