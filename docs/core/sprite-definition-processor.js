/**
	SpriteDefinitionProcessor

	Iterate the sprite definitions of a scene config, and produce sprite instances
 */

class SpriteDefinitionProcessor {
	constructor() {
		this.spriteProvider = new SpriteProvider(() => new Sprite());
		this.spriteCollector = [];
	}

	init(spriteDefinitions, scene) {
		if (spriteDefinitions) {
			for (let i = 0; i < spriteDefinitions.length; i++) {
				scene.evaluate(spriteDefinitions[i].init, spriteDefinitions[i]);
			}
		}
	}

	process(spriteDefinitions, scene) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		for (let i = 0; i < spriteDefinitions.length; i++) {
			const definition = spriteDefinitions[i];
			scene.evaluate(definition.refresh, definition);
			this.processSpriteDefinition(definition, i, spriteCollector, scene);
		}
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector, scene) {
		const { spriteProvider } = this;
		const { count } = definition;
		const totalCount = scene.evaluate(count, definition, definitionIndex);

		for (let i = 0; i < totalCount; i ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, i);
			sprite.getEvaluated(scene, definition);
			spriteCollector.push(sprite);
		}
	}
}