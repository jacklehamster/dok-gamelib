/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


class ShapeUtils {
	static cube(params) {
		let { position, topSrc, sideSrc, scale, hidden, cubeCount, topAnimation, sideAnimation, fixed } = params;

		const SPRITE_TYPES = [
			{ type: SpriteType.Floor, 		offset: [ 0, 1, 0] },
			{ type: SpriteType.Front, 		offset: [ 0, 0, 1 ] },
			{ type: SpriteType.Back,  		offset: [ 0, 0, -1 ] },
			{ type: SpriteType.LeftWall, 	offset: [ 1, 0, 0 ] },
			{ type: SpriteType.RightWall, 	offset: [ -1, 0, 0 ] },
		];

		return {
			toSourceCode: (_,editor) => `ShapeUtils.cube(${editor.formatCode(params)})`,
			topSrc,
			sideSrc,
			src: ({definition}, index) => SpriteType.Floor === definition.type.get(index) ? definition.topSrc.get(Math.floor(index / SPRITE_TYPES.length)) : definition.sideSrc.get(Math.floor(index / SPRITE_TYPES.length)),
			type: (_, index) => SPRITE_TYPES[index % SPRITE_TYPES.length].type,
			cubeHidden: hidden || false,
			hidden: ({definition}, index) => definition.cubeHidden.get(Math.floor(index / SPRITE_TYPES.length)),
			scale: scale || [ 0, 0 ],
			position: position || [ 0, 0, 0],
			topAnimation: topAnimation || (() => null),
			sideAnimation: sideAnimation || (() => null),
			animation: ({definition}, index) => SpriteType.Floor === definition.type.get(index) ? definition.topAnimation.get(Math.floor(index / SPRITE_TYPES.length)) : definition.sideAnimation.get(Math.floor(index / SPRITE_TYPES.length)),
			pos: [
				({definition}, index) => definition.position[0].get(Math.floor(index / SPRITE_TYPES.length)) + SPRITE_TYPES[index % SPRITE_TYPES.length].offset[0] * definition.scale[0].get(Math.floor(index / SPRITE_TYPES.length)) / 2,
				({definition}, index) => definition.position[1].get(Math.floor(index / SPRITE_TYPES.length)) + SPRITE_TYPES[index % SPRITE_TYPES.length].offset[1] * definition.scale[0].get(Math.floor(index / SPRITE_TYPES.length)) / 2,
				({definition}, index) => definition.position[2].get(Math.floor(index / SPRITE_TYPES.length)) + SPRITE_TYPES[index % SPRITE_TYPES.length].offset[2] * definition.scale[1].get(Math.floor(index / SPRITE_TYPES.length)) / 2,
			],
			fixed,
			cubeCount: cubeCount || 1,
			count: ({definition}, index) => 5 * definition.cubeCount.get(Math.floor(index / SPRITE_TYPES.length)),
		};
	}

	static cylinder(params) {
		const { src, type, cols, rows, radius, center, scale, brightness, tintColor, hue, hidden, spherical, fixed } = params;
		return {
			toSourceCode: (_,editor) => `ShapeUtils.cylinder(${editor.formatCode(params)})`,
			src,
			type: type || SpriteType.Front,
			cols,
			rows,
			radius,
			rotation: {
				angle: [
					0,
					({definition: { cols, rows }}, index) => ((index % cols.get()) / cols.get() - .5) * Math.PI * 2,
					0,
				],
			},
			center,
			pos: [
				({definition: { center, rotation, radius }}, index) => center[0].get() + Math.sin(- rotation.angle[1].get(index)) * radius.get(),
				({definition: { center, cols }}, index) => center[1].get() + Math.floor(index / cols.get()),
				({definition: { center, rotation, radius }}, index) => center[2].get() - Math.cos(- rotation.angle[1].get(index)) * radius.get(),
			],
			scale,
			frame: (_, index) => index,
			spherical,
			effects: {
				tintColor,
				brightness,
				hue,
				blackhole: {
					center: [
						({definition: { center }}) => center[0].get(),
						({definition: { center }}) => center[1].get() + 1,
						({definition: { center }}) => center[2].get(),
					],
					strength: ({definition: {spherical}}) => spherical ? 1 : 0,
					distance: ({definition: {radius}}) => radius.get(),
				},
			},
			hidden,
			fixed,
			count: ({definition: {cols, rows}}) => rows.get() * cols.get(),
		};
	}
}
