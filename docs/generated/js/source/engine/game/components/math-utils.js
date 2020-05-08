/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class MathUtils {
 	static distance([x0,_,z0], [x1,_z1]) {
 		const dx = x0-x1, dz = z0-z1;
 		return Math.sqrt(dx*dx + dz*dz);
 	}
 }