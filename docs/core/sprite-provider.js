/**
	SpriteProvider
 */

class SpriteProvider {
	constructor(type) {
		this.type = type;
		this.sprites = [];
		this.count = 0;
		this.definitionMapper = [];
	}

	clear() {
		this.count = 0;
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
		const SpriteConstructor = SpriteProvider.registry[this.type];
		if (!SpriteConstructor) {
			return null;
		}
		while (this.count >= this.sprites.length) {
			const providerIndex = this.sprites.length;
			const sprite = new SpriteConstructor();
			sprite.providerIndex = providerIndex;
			this.sprites.push(sprite);
		}
		const sprite = this.sprites[this.count++];
		sprite.definitionIndex = definitionIndex;
		sprite.instanceIndex = instanceIndex;
		return sprite;
	}

	recycle(sprite) {
		const { providerIndex } = sprite;
		const lastIndex = this.count-1;
		if (lastIndex !== providerIndex) {
			this.sprites[providerIndex] = this.sprites[lastIndex];
			this.sprites[providerIndex].providerIndex = providerIndex;
			this.sprites[lastIndex] = sprite;
			this.sprites[lastIndex].providerIndex = lastIndex;
		}
		sprite.definitionIndex = -1;
		sprite.instanceIndex = -1;
		this.count --;
	}

	static register(type, SpriteConstructor) {
		if (!SpriteProvider.registry) {
			SpriteProvider.registry = {};
		}
		SpriteProvider.registry[type] = SpriteConstructor;
	}
}