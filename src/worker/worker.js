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

if (typeof(window) === 'undefined') {
	var window = self;

	self.importScripts('../../sources.js');
	console.log(sources);
	const { mini } = sources;

	if (mini.engine && mini.editor) {
		self.importScripts(`../../${mini.engine}`);
		self.importScripts('../editor/editor/editor-utils.js');
	} else {
		self.importScripts(...sources.lib.map(src => `../lib/${src}`));
		self.importScripts(...sources.engine.map(src => `../engine/${src}`));
		self.importScripts('../editor/editor/editor-utils.js');
	}

	let workerEngine;
	const windowStatus = {};

	const textureManager = new WorkerTextureManager();
	const communicator = new Communicator();
	const uiRenderer = new UIRenderer(new EngineUIRenderer(communicator));

	self.addEventListener('message', function(event) {
		const {data: { action }}  = event;
		switch(action) {
			case "init": {
				const {data: { data, localStorageData, pathname }}  = event;
				workerEngine = new WorkerEngine(SceneManager.instance,
					{ pathname, data, localStorageData, textureManager, communicator, uiRenderer, windowStatus });
				break;
			}
			case "ping": {
				const {data: { message }}  = event;
				self.postMessage({
					action: "response",
					message: message,
				});
				break;
			}
			case "gotoScene": {
				const {data: { name }}  = event;
				workerEngine.gotoScene(name);
				break;
			}
			case "import": {
				const {data: { name, gameBlob }}  = event;
				SceneManager.loadingSceneName = name;
				self.importScripts(gameBlob);
				URL.revokeObjectURL(gameBlob);
				break;
			}
			case "keydown": {
				const {data: { code }} = event;
				if (workerEngine) {
					workerEngine.keyboard.onKeyDown(code);
				}
				break;
			}
			case "keyup": {
				const {data: { code }} = event;
				if (workerEngine) {
					workerEngine.keyboard.onKeyUp(code);
				}
				break;
			}
			case "mouse": {
				const {data: {x,y,mouseDown}} = event;
				if (workerEngine) {
					workerEngine.mouse.onMouse(x,y,mouseDown);
				}
				break;
			}
			case "returnBuffer": {
				const {data: { dataView }} = event;
				communicator.returnBuffer(dataView);
				break;
			}
			case "clickUI": {
				const {data: { id, instanceIndex }} = event;
				uiRenderer.triggegClick(id, instanceIndex);
				break;				
			}
			case "askWorker": {
				const {data: { callback }} = event;
				eval(callback)(workerEngine);
				break;
			}
			case "videoDimension": {
				const {data: {src, rect}} = event;
				textureManager.updateVideoDimension(src, rect);
				break;
			}
			case "visibilitychange": {
				const {data: {hidden}} = event;
				if (workerEngine && windowStatus.hidden !== hidden) {
					windowStatus.hidden = hidden;
					if (!windowStatus.hidden) {
						workerEngine.setPaused(false);
					}
				}
				break;
			}
			case "beautifyCode": {
				const {data: {code, callbackId}} = event;
				const newCode = Tools.highlight("javascript", code, true).value;
				self.postMessage({
					action: "beautifyCode",
					code: newCode,
					callbackId,
				});				
				break;
			}
		}
	});
}