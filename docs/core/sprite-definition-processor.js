/**
	SpriteDefinitionProcessor

	Iterate the sprite definitions of a scene config, and produce sprite instances
 */

const SpriteConstructors = {
	null: Sprite,
	undefined: Sprite,
	'sprite': Sprite,
};

class SpriteDefinitionProcessor {
	constructor(evaluator) {
		this.evaluator = evaluator;
		this.spriteProviders = {};
		this.spriteCollector = [];
	}

	process(spriteDefinitions) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		spriteDefinitions.forEach((definition, definitionIndex) => this.processSpriteDefinition(definition, definitionIndex, spriteCollector));
		return spriteCollector;
	}

	getSpriteProvider(type) {
		if (!this.spriteProviders[type]) {
			const SpriteConstructor = SpriteConstructors[type];
			if (SpriteConstructor) {
				this.spriteProviders[type] = new SpriteProvider(type, SpriteConstructor);
			}
		}
		return this.spriteProviders[type];
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector) {
		const { evaluator } = this;
		const { type, count } = definition;
		const totalCount = evaluator.evaluate(count) || 1;
		const spriteProvider = this.getSpriteProvider(type);

		for (let instanceIndex = 0; instanceIndex < totalCount; instanceIndex ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, instanceIndex);
			sprite.getEvaluated(evaluator, definition);
			spriteCollector.push(sprite);
		}
	}
}