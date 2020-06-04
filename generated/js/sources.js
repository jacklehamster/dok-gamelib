const sources = {
	"engine": [
		"interfaces/data-store-interface.js",
		"interfaces/dom-manager-interface.js",
		"interfaces/logger-interface.js",
		"interfaces/media-manager-interface.js",
		"interfaces/newgrounds-interface.js",
		"interfaces/scene-gl-interface.js",
		"interfaces/scene-ui-interface.js",
		"interfaces/sprite-renderer-interface.js",
		"lib/gl-matrix.js",
		"lib/newgroundsio.min.js",
		"lib/ng.js",
		"common/constants.js",
		"utils/log.js",
		"sprites/base/base-sprite.js",
		"sprites/image-sprite.js",
		"sprites/animated-sprite.js",
		"sprites/sprite.js",
		"sprites/ui-sprite.js",
		"core/config-processor.js",
		"core/data-store.js",
		"core/engine-buffer.js",
		"core/engine.js",
		"core/game-property.js",
		"core/gl-renderer.js",
		"core/media-manager.js",
		"core/scene-gl.js",
		"core/scene-refresher.js",
		"core/scene-renderer.js",
		"core/scene-ui.js",
		"core/shader.js",
		"core/sprite-data-processor.js",
		"core/sprite-definition-processor.js",
		"core/sprite-provider.js",
		"core/spritesheet-manager.js",
		"core/texture-manager.js",
		"core/worker-manager.js",
		"communicator/buffer-transport-config.js",
		"communicator/engine-scene-renderer.js",
		"communicator/engine-ui-renderer.js",
		"controls/gamepad.js",
		"controls/keyboard.js",
		"controls/mouse.js",
		"ui/canvas-renderer.js",
		"ui/dom-manager.js",
		"ui/focus-fixer.js",
		"ui/ui-renderer.js",
		"debug/logger.js",
		"worker/worker-data-store.js",
		"worker/worker-dom-manager.js",
		"worker/worker-engine.js",
		"worker/worker-logger.js",
		"worker/worker-media-manager.js",
		"worker/worker-newgrounds.js",
		"worker/worker-sprite-renderer.js",
		"worker/worker-texture-manager.js",
		"game/components/color-utils.js",
		"game/components/motion-utils.js",
		"game/components/shape-utils.js",
		"game/components/sprite-utils.js",
		"game/components/text-utils.js",
		"game/base/base-definition.js",
		"game/animation-definition.js",
		"game/game.js",
		"game/sprite-definition.js",
		"game/ui-definition.js",
		"scene-manager/scene-manager.js"
	],
	"editor": [
		"editor/editor-utils.js",
		"editor/editor.js",
		"editor/scene-thumbnail.js"
	],
	"lib": [
		"json-compact.js"
	],
	"game": [
		"scenes/cubot/start.js",
		"scenes/dobuki/start.js",
		"scenes/keep-alive/start.js",
		"scenes/keep-alive-intro/start.js",
		"scenes/penguin/start.js",
		"scenes/rogue-zombie/start.js",
		"scenes/stup/start.js",
		"scenes/tp-boy/start.js",
		"scenes/video-maze/start.js"
	],
	"mini": {
		"engine": "engine/engine.min.js",
		"editor": "editor/editor.min.js"
	}
}