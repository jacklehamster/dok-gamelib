/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

/**
	SurfaceAllocator
 *	Allocate space on a surface
 */

//	One chunk of the surface.
class SurfaceChunk {
 	constructor(index, width, height, parent, surfaceAllocator) {
 		this.index = index;
 		this.width = width;
 		this.height = height;
 		this.parent = parent;
 		this.chunks = [];
 	}
}

class SurfaceAllocator {
 	constructor(freeCells) {
 		this.chunks = [
 		];
 	}
}