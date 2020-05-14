/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	Engine
  */

class Engine {
	constructor(canvas, sceneManager, data) {
		this.canvas = canvas;
		this.sceneManager = sceneManager;
		this.data = data;
		this.onSceneChangeListener = [];
		this.onLoopListener = [];
		this.onStartListener = [];
		this.onLoadListener = [];
		this.canvas.focus();
		this.gl = this.initCanvasGL(canvas);
		this.dataStore = new DataStore(localStorage);
		this.workerManager = new WorkerManager(this, this.dataStore);
		this.mediaManager = new MediaManager(this.data.generated);
		this.textureManager = new TextureManager(this.gl, this.mediaManager, this.workerManager);
		this.domManager = new DOMManager(document);
		this.spritesheetManager = new SpritesheetManager(this.data.generated);
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.canvasRenderer = new CanvasRenderer(this.spriteDataProcessor, this.spritesheetManager, this.data.generated);
		this.sceneUI = new SceneUI(this.canvas, this.workerManager, this.canvasRenderer);
		this.newgrounds = new NewgroundsWrapper(this.data.generated.game.newgrounds);
		this.configProcessor = new ConfigProcessor(this.data);
		this.focusFixer = new FocusFixer(canvas);

		this.glRenderer = new GLRenderer(this.gl, this.textureManager, this.data.webgl, this.engineCommunicator, this.spriteProvider, this.spriteDataProcessor, this.data.generated);
		this.sceneGL = new SceneGL(canvas, this.glRenderer.gl, this.glRenderer.shader);
		this.communicator = new Communicator(this, this.sceneGL, this.sceneUI, this.domManager, new Logger(), this.dataStore, this.mediaManager, this.newgrounds, this.glRenderer);

		this.keyboard = new Keyboard(this.workerManager, document, {});
		this.mouse = new Mouse(this.workerManager, canvas, document, {});

		document.addEventListener("visibilitychange", (event) => {
			this.workerManager.onVisibilityChange(document.hidden);
		});

		window.addEventListener("blur", () => this.workerManager.onVisibilityChange(true));
		window.addEventListener("focus", () => this.workerManager.onVisibilityChange(false));

		this.currentSceneName = null;
		this.loaded = false;

		this.init();
	}

	start() {
		this.onStartListener.forEach(listener => listener(this));
		this.setCurrentScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
//		console.log("start scene:", this.currentScene.name);
	}

	init() {
		//	load texture
		this.spritesheetManager.fetchImages(
			progress => console.log(progress.toFixed(2) + "%"),
			images => {
				images.forEach((image, index) => {
					this.textureManager.setImage(index, image);
				});
			},
			errors => console.error(errors)
		);
		this.addEventListener("start", () => this.importScenes());
	}

	initCanvasGL(canvas) {
		const { width, height } = this.data.generated.game;
		const resolution = devicePixelRatio;
		canvas.width = width * resolution;
		canvas.height = height * resolution;
		canvas.style.width = `${canvas.width / resolution}px`;
		canvas.style.height = `${canvas.height / resolution}px`;

		const webGLOptions = {
			antialias: false,
			preserveDrawingBuffer: false,
			alpha: false,
			depth: true,
			stencil: false,
			desynchronized: true,
			premultipliedAlpha: true,
		};
		const gl = canvas.getContext("webgl", webGLOptions);

		this.checkSupport(gl);
		this.applyExtensions(gl);

		//	initialize gl
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

		gl.cullFace(gl.BACK);
		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
		return gl;
	}

	applyExtensions(gl) {
		return [
			gl.getExtension('OES_element_index_uint'),
		];
	}

	checkSupport(gl) {
		const settings = {
			maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
			maxVarying: gl.getParameter(gl.MAX_VARYING_VECTORS),
			maxUniform: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
			renderer: gl.getParameter(gl.RENDERER),
			version: gl.getParameter(gl.VERSION),
			renderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
		};
		console.info(settings);
	}

	askWorker(callback) {
		if (!this.isEditor()) {
			throw new Error("askWorker is only available in edit mode.");
		}
		this.workerManager.askWorker(callback);
	}

	loopVideo() {
		const { textureManager, mediaManager: { playingVideos }} = this;
		if (playingVideos.length) {
			textureManager.updateVideosTexture(playingVideos);
		}
	}

	isEditor() {
		const match = location.search.match(/\beditor=([a-zA-Z0-9_]+)\b/);
		return match && match[1] ? match[1] === 1 || match[1] === "true" : this.data.generated.game.editor;
	}

	makeScene(sceneName) {
		const { sceneManager, dataStore, configProcessor } = this;
		return sceneManager.createScene(sceneName, dataStore, configProcessor);
	}

	importScenes() {
		const { sceneManager, dataStore, configProcessor } = this;
		sceneManager.sceneNames.forEach(sceneName => {
			this.workerManager.import(this.makeScene(sceneName));
		});
	}

	setCurrentScene(name) {
		this.currentSceneName = name;
		this.workerManager.gotoScene(name);
	}

	refresh(now, buffer, count, extra) {
		const { communicator, sceneUI, glRenderer, onLoopListener } = this;
		if (buffer && count) {
			communicator.applyBuffer(buffer, count, extra);
		}
		this.loopVideo();
		sceneUI.updateUI(now);
		glRenderer.draw(now);
		for (let i = 0; i < onLoopListener.length; i++) {
			onLoopListener[i](now);
		}
		if (!this.loaded) {
			this.onLoadListener.forEach(callback => callback());
			this.loaded = true;			
		}
	}

	getListeners(type) {
		switch(type) {
			case "sceneChange":
				return this.onSceneChangeListener;
			case "loop":
				return this.onLoopListener;
			case "start":
				return this.onStartListener;
			case "load":
				return this.onLoadListener;
		}
	}

	addEventListener(type, callback) {
		const listener = this.getListeners(type);
		listener.push(callback);
	}

	removeEventListener(type, callback) {
		const listener = this.getListeners(type);
		const index = listener.indexOf(callback);
		listener.splice(index, 1);
	}

	gotoScene(sceneName) {
		if (this.processGameInEngine) {
			this.currentScene.gotoScene(sceneName);
		}
		this.workerManager.gotoScene(sceneName);
	}

	notifySceneChange(sceneName) {
		this.onSceneChangeListener.forEach(callback => callback(sceneName));
	}

	sendScore(score) {
//		this.newgrounds.postScore(score);
	}

	unlockMedal(medalName) {
//		this.newgrounds.unlockMedal(medalName);
	}
}
