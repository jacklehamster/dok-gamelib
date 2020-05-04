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
	init(sprites) {
		for (let i = 0; i < sprites.length; i++) {
			sprites[i].init.run();
		}
	}

	refresh(sprites, now) {
		for (let i = 0; i < sprites.length; i++) {
			const definition = sprites[i];
			if (definition.refreshing) {
				const refreshRate = definition.refreshRate.get();
				if (refreshRate && now - definition.lastRefresh < 1000 / refreshRate) {
					continue;
				}
				definition.refresh.run();
				definition.lastRefresh = now;
			}
		}
	}

	ignore() {
		return EMPTY_ARRAY;
	}

	process(spriteDefinitions, scene, spriteProvider, spriteCollector) {
		spriteCollector.length = 0;

		//	register IDs
		for (let i = 0; i < spriteDefinitions.length; i++) {
			const definition = spriteDefinitions[i];
			const definitionId = definition.id.get();
			if (definitionId) {
				scene.definitions[definitionId] = definition;			
			}
		}

		for (let i = 0; i < spriteDefinitions.length; i++) {
			this.processSpriteDefinition(spriteDefinitions[i], i, spriteCollector, scene, spriteProvider);
		}
		return spriteCollector;
	}

	processSpriteDefinition(definition, definitionIndex, spriteCollector, scene, spriteProvider) {
		const { count } = definition;
		const totalCount = count.get(definitionIndex);

		for (let i = 0; i < totalCount; i ++) {
			const sprite = spriteProvider.getSprite(definitionIndex, i);
			if (sprite.shouldEvaluate(scene.now)) {
				sprite.getEvaluated(scene, definition);
			} else {
				sprite.skipProcess = true;
			}
			spriteCollector.push(sprite);
		}
	}

	destroy(sprites) {
		sprites.forEach(sprite => sprite.destroy.run());
	}
}