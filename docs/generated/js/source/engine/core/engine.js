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
		canvas.focus();
		this.canvas = canvas;
		this.sceneManager = sceneManager;
		this.data = data;
		this.currentScene = null;
		this.spritesToRemove = [];
		this.onSceneChangeListener = [];
		this.onLoopListener = [];
		this.onStartListener = [];
		this.running = false;
		this.gl = this.initCanvasGL(canvas);
		this.timeScheduler = new TimeScheduler();
		this.dataStore = new DataStore(localStorage);
		this.workerManager = new WorkerManager(this, this.dataStore);
		this.mediaManager = new MediaManager(this.data.generated);
		this.textureManager = new TextureManager(this.gl, this.mediaManager, this.workerManager);
		this.domManager = new DOMManager(document);
		this.spritesheetManager = new SpritesheetManager(this.data.generated);
		this.sceneRefresher = new SceneRefresher();
		this.uiProvider = new SpriteProvider(() => new UISpriteInstance());
		this.spriteProvider = new SpriteProvider(() => new SpriteInstance());
		this.spriteDefinitionProcessor = new SpriteDefinitionProcessor();
		this.spriteDataProcessor = new SpriteDataProcessor();
		this.canvasRenderer = new CanvasRenderer(this.spriteDataProcessor, this.spritesheetManager, this.data.generated);
		this.sceneUI = new SceneUI(this.canvas, this.workerManager, this.canvasRenderer);
		this.newgrounds = new NewgroundsWrapper(this.data.generated.game.newgrounds);
		this.configProcessor = new ConfigProcessor(this.data);
		this.focusFixer = new FocusFixer(canvas);
		this.processGameInEngine = false;
		this.processSceneInEngine = true;

		if (this.processSceneInEngine) {
			this.engineCommunicator = new EngineCommunicator();
			this.sceneRenderer = new SceneRenderer(new EngineSceneRenderer(this.engineCommunicator), this.mediaManager, this.domManager);
			this.uiRenderer = new UIRenderer(new EngineUIRenderer(this.engineCommunicator));
		}
		this.glRenderer = new GLRenderer(this.gl, this.textureManager, this.data.webgl, this.engineCommunicator, this.spriteProvider, this.spriteDataProcessor, this.data.generated);
		this.sceneGL = new SceneGL(canvas, this.glRenderer.gl, this.glRenderer.shader);
		this.communicator = new Communicator(this, this.sceneGL, this.sceneUI, this.domManager, new Logger(), this.dataStore, this.mediaManager, this.newgrounds, this.glRenderer);

		this.keyboard = new Keyboard(this.workerManager, document, {
			onKeyPress: key => this.currentScene.keyboard.onKeyPress.run(key),
			onKeyRelease: key => this.currentScene.keyboard.onKeyRelease.run(key),
			onDownPress: () => this.currentScene.keyboard.onDownPress.run(),
			onDownRelease: () => this.currentScene.keyboard.onDownRelease.run(),
			onLeftPress: () => this.currentScene.keyboard.onLeftPress.run(),
			onLeftRelease: () => this.currentScene.keyboard.onLeftRelease.run(),
			onUpPress: () => this.currentScene.keyboard.onUpPress.run(),
			onUpRelease: () => this.currentScene.keyboard.onUpRelease.run(),
			onRightPress: () => this.currentScene.keyboard.onRightPress.run(),
			onRightRelease: () => this.currentScene.keyboard.onRightRelease.run(),
			onActionPress: () => this.currentScene.keyboard.onActionPress.run(),
			onActionRelease: () => this.currentScene.keyboard.onActionRelease.run(),
			onTurnLeftPress: () => this.currentScene.keyboard.onTurnLeftPress.run(),
			onTurnLeftRelease: () => this.currentScene.keyboard.onTurnLeftRelease.run(),
			onTurnRightPress: () => this.currentScene.keyboard.onTurnRightPress.run(),
			onTurnRightRelease: () => this.currentScene.keyboard.onTurnRightRelease.run(),
		});
		this.mouse = new Mouse(this.workerManager, canvas, document, {
			onMouseDown: mouseStatus => this.currentScene.mouse.onMouseDown.run(mouseStatus),
			onMouseUp: mouseStatus => this.currentScene.mouse.onMouseUp.run(mouseStatus),
			onMouseMove: mousePosition => this.currentScene.mouse.onMouseMove.run(mousePosition),			
		});

		window.addEventListener("load", () => {
			this.running = true;
		});

		if (this.processGameInEngine) {
			this.addEventListener("sceneChange", () => {
				this.sceneRefresher.init(this.currentScene);
				this.spriteDataProcessor.init(this.currentScene);
				this.spriteDefinitionProcessor.init(this.currentScene.sprites);
				this.spriteDefinitionProcessor.init(this.currentScene.ui);
			});
		}
		//	load texture
		this.spritesheetManager.fetchImages(
			progress => console.log(progress.toFixed(2) + "%"),
			images => images.forEach((image, index) => this.textureManager.setImage(index, image)),
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

	start() {
//		this.beginLooping();
		this.onStartListener.forEach(listener => listener(this));
		this.setCurrentScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
//		this.resetScene(this.sceneManager.getFirstSceneName(this.data.generated.game));
//		console.log("start scene:", this.currentScene.name);
	}

	isEditor() {
		const match = location.search.match(/\beditor=([a-zA-Z0-9_]+)\b/);
		return match && match[1] ? match[1] === 1 || match[1] === "true" : this.data.generated.game.editor;
	}

	importScenes() {
		const { sceneManager, dataStore, configProcessor } = this;
		sceneManager.sceneNames.forEach(sceneName => {
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor);
			this.workerManager.import(scene);
		});
	}

	setCurrentScene(name) {
		this.workerManager.gotoScene(name);
	}

	beginLooping() {
		const engine = this;
		const { glRenderer, sceneRefresher, sceneRenderer, uiRenderer, spriteDefinitionProcessor, spriteProvider, uiProvider, mediaManager,
				keyboard, mouse, spritesToRemove, onLoopListener, spriteDataProcessor, sceneGL, timeScheduler, engineCommunicator,
				sceneUI } = engine;

		let lastRefresh = 0;

		const spriteCollector = [];
		const uiCollector = [];

		function animationFrame(time) {
			requestAnimationFrame(animationFrame);
			time = Math.round(time);
			const { currentScene, running } = engine;
			if (!running || !currentScene) {
				return;
			}

			const { textureManager } = glRenderer;
			const { playingVideos } = mediaManager;
			textureManager.updateVideosTexture(playingVideos);

			if (engine.processGameInEngine) {
				if (!currentScene.startTime) {
					currentScene.startTime = time;
					return;
				}
				const now = time - currentScene.startTime;
				currentScene.now = now;

				if (sceneRenderer) {
					keyboard.refresh(currentScene, now);
					mouse.refresh(currentScene, now);
					spriteDefinitionProcessor.refresh(currentScene.ui, now);
				}

				timeScheduler.process(now);
				sceneRefresher.refresh(currentScene);
				spriteDataProcessor.refresh(currentScene);
				spriteDefinitionProcessor.refresh(currentScene.sprites, now);

				const frameDuration = 1000 / currentScene.getFrameRate();
				if (time - lastRefresh >= frameDuration) {
					const shouldResetScene = currentScene.nextScene;
					lastRefresh = now;

					spriteDataProcessor.process(currentScene);

					//	show sprites to process
					const sprites = shouldResetScene ? EMPTY_ARRAY : spriteDefinitionProcessor.process(currentScene.sprites, currentScene, spriteProvider, spriteCollector);

					if (sceneRenderer) {
						//	process UI
						const uiComponents = shouldResetScene ? EMPTY_ARRAY : spriteDefinitionProcessor.process(currentScene.ui, currentScene, uiProvider, uiCollector);
						uiRenderer.render(uiComponents, now);
						sceneRenderer.render(currentScene);
						glRenderer.sendSprites(sprites, now);
						engine.communicator.applyBuffer(
							engineCommunicator.getBuffer(),
							engineCommunicator.getCount(),
							engineCommunicator.getExtra()
						);
						engineCommunicator.clear();

						mediaManager.updatePlayingVideos(sprites, now);
					}
					sceneUI.updateUI(now);

					//	draw
					glRenderer.draw(now);

					for (let i = 0; i < onLoopListener.length; i++) {
						onLoopListener[i](now);
					}

					//	resetpool
					if (shouldResetScene) {
						engine.resetScene(currentScene.nextScene);
					}
				}
			}
		}
		requestAnimationFrame(animationFrame);		
	}

	refresh(now, buffer, count, extra) {
		const { communicator, sceneUI, glRenderer, sceneRenderer, processGameInEngine } = this;
		if (!sceneRenderer || !processGameInEngine) {
			if (buffer && count) {
				communicator.applyBuffer(buffer, count, extra);
			}
			this.loopVideo();
			sceneUI.updateUI(now);
			glRenderer.draw(now);
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

	clearScene() {
		if (this.currentScene) {
			this.spriteDefinitionProcessor.destroy(this.currentScene.ui);
			this.spriteDefinitionProcessor.destroy(this.currentScene.sprites);
			this.spriteDataProcessor.destroy(this.currentScene);
			this.currentScene.destroy.run();
		}
		this.sceneUI.destroy();
		this.uiProvider.clear();
		this.spriteProvider.clear();
		this.glRenderer.clear();
	}

	gotoScene(sceneName) {
		if (this.processGameInEngine) {
			this.currentScene.gotoScene(sceneName);
		}
		this.workerManager.gotoScene(sceneName);
	}

	resetScene(sceneName) {
		const { sceneManager, dataStore, configProcessor } = this;
		if (sceneManager.hasScene(sceneName)) {
			if (this.currentScene && this.currentScene.name === sceneName) {
				this.currentScene.nextScene = null;
				return;
			}
			this.clearScene();
			const scene = sceneManager.createScene(sceneName, dataStore, configProcessor, this);

			this.currentScene = scene;
			this.currentScene.startTime = 0;
			this.currentScene.now = 0;
			this.setCurrentScene(this.currentScene.name);
			this.notifySceneChange(sceneName);
			window.game = scene;
		}
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
