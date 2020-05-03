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
		'../common/constants.js',
		'../core/config-processor.js',
		'../core/data-store.js',
		'../core/scene-refresher.js',
		'../core/sprite-definition-processor.js',
		'../core/sprite-data-processor.js',
		'../core/sprite-provider.js',
		'../core/game-property.js',
		'../controls/keyboard.js',
		'../sprites/base/base-sprite.js',
		'../sprites/ui-sprite.js',
		'../sprites/image-sprite.js',
		'../sprites/animated-sprite.js',
		'../sprites/sprite.js',
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
		'worker-engine.js',
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
		}
	});
}