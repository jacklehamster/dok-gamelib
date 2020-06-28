/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class SpriteUtils {
	static getOrientationCycle(spriteAngle, viewTurn, cycleCount) {
		const angleCycle = Math.PI * 2;
		const rotation = spriteAngle - viewTurn;
		const dir = Math.round(((rotation % angleCycle + angleCycle) % angleCycle) * cycleCount / angleCycle) % cycleCount;
		return dir;
	}

	static getDistance(x1, z1, x2, z2) {
		const dx = x1 - x2;
		const dz = z1 - z2;
		return Math.sqrt(dx*dx + dz*dz);
	}


	static overlap(x, z, definition, instanceIndex, multiplier) {
		const mul = multiplier || 1;
		const index = instanceIndex || 0;
		if (definition && definition.type.get(index) === SpriteType.Floor) {
			const floorX = definition.pos[0].get(index);
			const floorZ = definition.pos[2].get(index);
			const halfwidth = definition.scale[0].get(index) / 2 * mul;
			const halfheight = definition.scale[1].get(index) / 2 * mul;

			const radius = definition.circleRadius.get(index);
			const dx = (floorX - x) / halfwidth;
			const dz = (floorZ - z) / halfheight;
			if (radius > 0) {
				const dist = Math.sqrt(dx*dx + dz*dz);
				if (dist <= radius) {
					return true;
				}
			} else {
				return Math.abs(dx) < halfwidth && Math.abs(dz) < halfheight;
			}
		}
		return false;
	}

	static makeSprite(params) {
		const { id, position, heightAboveGround, shadowColor, spriteTint, spriteHue, spriteBrightness, scale, spriteSize, src,
			animation, init, refresh, refreshRate, hidden, spriteCount, fixed, data } = params;

		const zoomValue = ({definition}) => {
			const spriteWidth = definition.spriteSize[0].get(),
				  spriteHeight = definition.spriteSize[1].get();
			if (!spriteWidth || !spriteHeight) {
				return 1;
			}
			const maxSpriteSize = Math.max(spriteWidth, spriteHeight);
			return 1 / maxSpriteSize;
		};

		const realScale = [
			({definition: { spriteSize, zoomValue, upperScale, heightAboveGround }}, index) =>
				upperScale[0].get(Math.floor(index / 2)) * (spriteSize[0].get(Math.floor(index / 2)) || 1) * zoomValue.get(Math.floor(index / 2))
				* (index % 2 === 0 ? 1 : 1 / (1 + heightAboveGround.get(Math.floor(index / 2)) / 3)),
			({definition: { spriteSize, zoomValue, upperScale, heightAboveGround }}, index) =>
				upperScale[1].get(Math.floor(index / 2)) * (spriteSize[1].get(Math.floor(index / 2)) || 1) * zoomValue.get(Math.floor(index / 2))
				* (index % 2 === 0 ? 1 : 1 / (1 + heightAboveGround.get(Math.floor(index / 2)) / 3) * .7),
		];

		return {
			toSourceCode: () => `SpriteUtils.makeSprite(${EditorUtils.formatCode(params)})`,
			id,
			data,
			init,
			refresh,
			refreshRate,
			src,
			spriteHidden: hidden || false,
			spriteTint: spriteTint || 0,
			hidden: ({definition}, index) => definition.spriteHidden.get(Math.floor(index / 2)),
			type: (_, index) => index % 2 === 0 ? SpriteType.Sprite: SpriteType.Shadow,
			effects: {
				brigthness: spriteBrightness,
				hue: spriteHue,
				tintColor: ({definition}, index) => index % 2 === 0
					? definition.spriteTint.get(Math.floor(index/2)) : (shadowColor || 0xFF000000),
			},
			upperScale: scale || [1, 1],
			scale: realScale,
			zoomValue,
			spriteSize: spriteSize || [0, 0],
			spriteAnimation: animation || (() => null),
			animation: ({definition}, index) => definition.spriteAnimation.get(Math.floor(index / 2)),
			hotspot: [
				0,
				(_, index) => index % 2 === 0 ? .02 : .5,
			],
			position,
			heightAboveGround: heightAboveGround || (() => 0),
			pos: [
				({definition}, index) => definition.position[0].get(Math.floor(index / 2)),
				({definition}, index) => definition.position[1].get(Math.floor(index / 2))
					+ (index % 2 === 0 ? 0 : -.46 * definition.upperScale[1].get())
					+ (index % 2 === 0 ? (definition.heightAboveGround.get(Math.floor(index / 2)) || 0 ) : 0),
				({definition}, index) => definition.position[2].get(Math.floor(index / 2)) 
					- (index % 2 === 1 ? (definition.heightAboveGround.get(Math.floor(index / 2) || 0 ) * .4) : 0),				
			],
			fixed,
			spriteCount: spriteCount || 1,
			shadow: (_,index) => index % 2 === 1,
			count: ({definition}) => definition.spriteCount.get() * 2,
		};
	}
}