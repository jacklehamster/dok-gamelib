/**
	SpriteProvider
 */

class SpriteProvider {
	constructor(spriteCreator) {
		this.spriteCreator = spriteCreator;
		this.sprites = [];
		this.count = 0;
		this.definitionMapper = [];
	}

	clear() {
		this.count = 0;
		this.definitionMapper.length = 0;
	}

	getSprites() {
		return this.sprites;
	}

	getSprite(definitionIndex, instanceIndex) {
		const { definitionMapper } = this;
		while (definitionIndex >= definitionMapper.length) {
			definitionMapper.push([]);
		}
		const instanceList = definitionMapper[definitionIndex];
		if (!instanceList[instanceIndex]) {
			instanceList[instanceIndex] = this.newSprite(definitionIndex, instanceIndex);
		}
		return instanceList[instanceIndex];
	}

	newSprite(definitionIndex, instanceIndex) {
		const { spriteCreator } = this;
		if (!spriteCreator) {
			return null;
		}
		while (this.count >= this.sprites.length) {
			const providerIndex = this.sprites.length;
			const sprite = spriteCreator();
			sprite.providerIndex = providerIndex;
			this.sprites.push(sprite);
		}
		const sprite = this.sprites[this.count++];
		sprite.definitionIndex = definitionIndex;
		sprite.instanceIndex = instanceIndex;
		return sprite;
	}
}