/**
	SpriteDefinitionProcessor

	Iterate the sprite definitions of a scene config, and produce sprite instances
 */

class SpriteDefinitionProcessor {
	constructor(game) {
		this.game = game;
		this.spriteProvider = new SpriteProvider(() => new Sprite());
		this.spriteCollector = [];
	}

	init(spriteDefinitions) {
		const { game } = this;
		if (spriteDefinitions) {
			for (let i = 0; i < spriteDefinitions.length; i++) {
				game.evaluate(spriteDefinitions[i].init, spriteDefinitions[i], i);
			}
		}
	}

	process(spriteDefinitions) {
		const { spriteCollector } = this;
		spriteCollector.length = 0;
		for (let i = 0; i < spriteDefinitions.length; i++) {
			this.processSpriteDefinition(spriteDefinitions[i], i, spriteCollector);
		}
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector) {
		const { game, spriteProvider } = this;
		const { count } = definition;
		const totalCount = game.evaluate(count, definition, definitionIndex) || 1;

		for (let i = 0; i < totalCount; i ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, i);
			sprite.getEvaluated(game, definition);
			spriteCollector.push(sprite);
		}
	}
}