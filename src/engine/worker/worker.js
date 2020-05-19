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

	self.importScripts(
		'../lib/gl-matrix.js',
		'../utils/utils.js',
		'../utils/pool.js',
		'../utils/time-scheduler.js',
		'../interfaces/scene-gl-interface.js',
		'../interfaces/data-store-interface.js',
		'../interfaces/logger-interface.js',
		'../interfaces/newgrounds-interface.js',
		'../interfaces/media-manager-interface.js',
		'../interfaces/dom-manager-interface.js',
		'../interfaces/sprite-renderer-interface.js',
		'../common/constants.js',
		'../communicator/engine-communicator.js',
		'../communicator/engine-scene-renderer.js',
		'../communicator/engine-ui-renderer.js',
		'../core/config-processor.js',
		'../core/scene-refresher.js',
		'../core/sprite-definition-processor.js',
		'../core/sprite-data-processor.js',
		'../core/sprite-provider.js',
		'../core/scene-renderer.js',
		'../core/game-property.js',
		'../controls/keyboard.js',
		'../controls/mouse.js',
		'../sprites/base/base-sprite.js',
		'../sprites/ui-sprite.js',
		'../sprites/image-sprite.js',
		'../sprites/animated-sprite.js',
		'../sprites/sprite.js',
		'../game/components/color-utils.js',
		'../game/components/motion-utils.js',
		'../game/components/shape-utils.js',
		'../game/components/sprite-utils.js',
		'../game/components/text-utils.js',
		'../game/base/base-definition.js',
		'../game/animation-definition.js',
		'../game/ui-definition.js',
		'../game/sprite-definition.js',
		'../game/game.js',
		"../scene-manager/scene-manager.js",
		"../ui/ui-renderer.js",
		'../../lib/json-compact.js',
		'../../editor/editor/editor-utils.js',
		'worker-data-store.js',
		'worker-engine.js',
		'worker-newgrounds.js',
		'worker-logger.js',
		'worker-media-manager.js',
		'worker-dom-manager.js',
		'worker-texture-manager.js',
		'worker-sprite-renderer.js',
	);

	let workerEngine;
	const windowStatus = {};

	const textureManager = new WorkerTextureManager();
	const engineCommunicator = new EngineCommunicator();
	const uiRenderer = new UIRenderer(new EngineUIRenderer(engineCommunicator));

	self.addEventListener('message', function(event) {
		const {data: { action }}  = event;
		switch(action) {
			case "init": {
				const {data: { data, localStorageData }}  = event;
				workerEngine = new WorkerEngine(SceneManager.instance,
					{ data, localStorageData, textureManager, engineCommunicator, uiRenderer, windowStatus });
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
			case "payload": {
				workerEngine.processPayload(event.data);
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
				const {data: { buffer }} = event;
				engineCommunicator.restoreBuffer(buffer);
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
				if (windowStatus.hidden !== hidden) {
					windowStatus.hidden = hidden;
					workerEngine.setPaused(windowStatus.hidden);
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