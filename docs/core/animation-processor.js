class AnimationProcessor {
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
						result.push([ frames.join("-"), 1 ]);
					}
				}
			}
		});
		return result;
	}

	static postProcess(animations) {
		console.log(animations);
	}

	process(scene) {
		const { spriteData, now } = scene;
		spriteData.forEach(({src, spriteSize, grid, padding, animations }) => {
			const s = src.get();
			if (s) {
				const anim = this.data[s] || (this.data[s] = {
					spriteSize: [0, 0],
					grid: [1, 1],
					padding: 0,
					animations: {},
					timeUpdated: now,
				});

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

				let changedAnimations = false;
				animations.forEach(([name, frames]) => {
					const n = name.get(), f = frames.get();
					const tag = anim.animations[n] ? anim.animations[n].tag : null;
					if (f !== tag) {
						anim.animations[n] = {
							tag: f,
							animations: AnimationProcessor.produceAnimationChunks(f),
						};
						anim.timeUpdated = now;
						changedAnimations = true;
					}
				});
				if (changedAnimations) {
					AnimationProcessor.postProcess(anim.animations);
				}
			}
		});
	}
}
