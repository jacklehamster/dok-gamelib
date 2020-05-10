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
		'worker-data-store.js',
		'worker-engine.js',
		'worker-newgrounds.js',
		'worker-logger.js',
		'worker-media-manager.js',
		'worker-dom-manager.js',
	);

	let workerEngine;

	self.addEventListener('message', function(event) {
		const {data: { action }}  = event;
		switch(action) {
			case "init": {
				const {data: { data, localStorageData }}  = event;
				workerEngine = new WorkerEngine(SceneManager.instance, data, localStorageData);
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
			case "setScene": {
				const {data: { name }}  = event;
				workerEngine.resetScene(name);
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
				workerEngine.keyboard.onKeyDown(code);
				break;
			}
			case "keyup": {
				const {data: { code }} = event;
				workerEngine.keyboard.onKeyUp(code);
				break;
			}
			case "mouse": {
				const {data: {x,y,mouseDown}} = event;
				workerEngine.mouse.onMouse(x,y,mouseDown);
				break;
			}
			case "returnBuffer": {
				const {data: { buffer }} = event;
				workerEngine.engineCommunicator.restoreBuffer(buffer);
				break;
			}
			case "clickUI": {
				const {data: { id, instanceIndex }} = event;
				workerEngine.uiRenderer.triggegClick(id, instanceIndex);
				break;				
			}
			case "askWorker": {
				const {data: { callback }} = event;
				eval(callback)(workerEngine);
				break;
			}
		}
	});
}