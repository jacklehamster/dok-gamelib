/**
	SpriteDefinitionProcessor

	Iterate the sprite definitions of a scene config, and produce sprite instances
 */

class SpriteDefinitionProcessor {
	constructor(spriteProvider) {
		this.spriteProvider = spriteProvider;
		this.spriteCollector = [];
	}

	init(spriteDefinitions, scene) {
		for (let i = 0; i < spriteDefinitions.length; i++) {
			spriteDefinitions[i].init.run();
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

		for (let i = 0; i < totalCount; i ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, i);
			sprite.getEvaluated(scene, definition);
			spriteCollector.push(sprite);
		}
	}
}