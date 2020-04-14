class AnimationProcessor {
	constructor() {
		this.animationData = {};
	}

	process(scene) {
		const { spriteData, now } = scene;
		spriteData.forEach(({src, spriteSize, grid, padding, animations }) => {
			const s = src.get();
			if (s) {
				const anim = this.animationData[s] || (this.animationData[s] = {
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

				animations.forEach(([name, frames]) => {
					const n = name.get(), f = frames.get();
					const clip = anim.animations[n];
					if (f !== clip) {
						anim.animations[n] = f;
						anim.timeUpdated = now;
					}
				});

				if (anim.timeUpdated === now) {
					console.log(anim);
				}			
			}
		});
	}
}
