class SpriteDataProcessor {
	constructor() {
		this.data = {};
	}

	static produceAnimationChunks(sequence) {
		const result = [];
		sequence.split(",").forEach(str => {
			const [ range, repeat ] = str.split("*");
			if (typeof(repeat) === 'undefined' || !isNaN(repeat)) {
				for (let i = 0; i < parseInt(repeat||1); i++) {
					const frames = range.split("-").map(n => isNaN(n) ? n : parseInt(n));
					if (frames.length > 1 && !frames.every(a => isNaN(a))) {
						for (let i = 1; i < frames.length; i++) {
							const from = frames[i-1], to = frames[i], range = to - from + (from <= to ? 1 : -1);
							for (let n = Math.abs(range) - 1; n >= 0; n--) {
								result.push([ from, range ]);
							}
						}
					} else {
						result.push([ frames.length === 1 ? frames[0] : frames.join("-"), 1 ]);
					}
				}
			}
		});
		return result;
	}

	static postProcess(animationData) {
		let didProcess = false;
		for (let id in animationData) {
			const { animations } = animationData[id];
			const a = [];
			let updateAnimation = false;
			animations.forEach(([frame, count]) => {
				if (isNaN(frame)) {
					const data = animationData[frame];
					a.push(...data.animations);
					didProcess = true;
					updateAnimation = true;
				} else {
					a.push([frame, count]);
				}
			});
			if (updateAnimation) {
				animationData[id].animations = a;
			}
		}
		return didProcess;
	}

	init(scene) {
		const { spriteData } = scene;
		for (let i = 0; i < spriteData.length; i++) {
			spriteData[i].init.run();
		}
	}

	refresh(scene) {
		const { spriteData } = scene;
		for (let i = 0; i < spriteData.length; i++) {
			const definition = spriteData[i];
			const refreshRate = definition.refreshRate.get();
			if (refreshRate && scene.now - definition.lastRefresh < 1000 / refreshRate) {
				continue;
			}
			definition.refresh.run();
			definition.lastRefresh = scene.now;
		}
	}

	process(scene) {
		const { spriteData, now } = scene;
		spriteData.forEach(spriteDataElement => {
			const {id, src, spriteSize, grid, padding, frameRate, animations } = spriteDataElement;
			const s = src.get();
			if (s) {
				const elementId = id.get();
				if (elementId) {
					scene.definitions[elementId] = spriteDataElement;
				}
				const identifier = elementId || src.get();
				const anim = this.data[identifier] || (this.data[identifier] = {
					src: s,
					spriteSize: [0, 0],
					grid: [1, 1],
					padding: 0,
					frameRate: 24,
					animations: {},
					timeUpdated: now,
				});

				if (anim.scene !== scene.name) {
					anim.scene = scene.name;
				}

				const spriteWidth = spriteSize[0].get();
				const spriteHeight = spriteSize[1].get();
				const gridCols = grid[0].get();
				const gridRows = grid[1].get();
				const newPadding = padding.get();

				if (spriteWidth !== anim.spriteSize[0] || spriteHeight !== anim.spriteSize[1]
						|| gridCols !== anim.grid[0] || gridRows !== anim.grid[1] || newPadding !== anim.padding) {
					anim.spriteSize[0] = spriteWidth;
					anim.spriteSize[1] = spriteHeight;
					anim.grid[0] = gridCols;
					anim.grid[1] = gridRows;
					anim.padding = newPadding;
					anim.timeUpdated = now;
				}

				const newFrame = frameRate.get();
				if (newFrame !== anim.frameRate) {
					anim.frameRate = newFrame;
					anim.timeUpdated = now;
				}

				let changedAnimations = false;
				animations.forEach(([name, frames], index) => {
					const n = name.get(), f = frames.get();
					const tag = anim.animations[n] ? anim.animations[n].tag : null;
					if (f !== tag) {
						anim.animations[n] = {
							animations: SpriteDataProcessor.produceAnimationChunks(f),
							tag: f,
						};
						anim.timeUpdated = now;
						changedAnimations = true;
					}
					if (index === 0 && anim.first !== n) {
						anim.first = n;
						anim.timeUpdated = now;
					}

				});
				if (changedAnimations) {
					for (let i = 0; i < 10; i++) {
						if (!SpriteDataProcessor.postProcess(anim.animations)) {
							break;
						}
					}
				}
			}
		});
	}

	destroy(scene) {
		scene.spriteData.forEach(data => data.destroy.run());
		for (let i in this.data) {
			delete this.data[i];
		}
	}
}
