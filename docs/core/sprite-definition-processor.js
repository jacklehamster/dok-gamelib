/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	SpriteDefinitionProcessor

	Iterate the sprite definitions of a scene config, and produce sprite instances
 */

class SpriteDefinitionProcessor {
	constructor(spriteProvider) {
		this.spriteProvider = spriteProvider;
		this.spriteCollector = [];
	}

	init(scene) {
		const { sprites } = scene;
		for (let i = 0; i < sprites.length; i++) {
			sprites[i].init.run();
		}
	}

	refresh(scene) {
		for (let i = 0; i < scene.sprites.length; i++) {
			const definition = scene.sprites[i];
			const refreshRate = definition.refreshRate.get();
			if (refreshRate && scene.now - definition.lastRefresh < 1000 / refreshRate) {
				continue;
			}
			definition.refresh.run();
			definition.lastRefresh = scene.now;
		}
	}

	process(spriteDefinitions, scene, spriteProvider) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		for (let i = 0; i < spriteDefinitions.length; i++) {
			this.processSpriteDefinition(spriteDefinitions[i], i, spriteCollector, scene, spriteProvider);
		}
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector, scene, spriteProvider) {
		const { count } = definition;
		const totalCount = count.get( definitionIndex);

		SpriteDefinitionProcessor.lastProcessedDefinition = definition;

		for (let i = 0; i < totalCount; i ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, i);
			sprite.getEvaluated(scene, definition);
			spriteCollector.push(sprite);
		}
	}

	destroy(scene) {
		scene.sprites.forEach(sprite => sprite.destroy.run());
	}
}