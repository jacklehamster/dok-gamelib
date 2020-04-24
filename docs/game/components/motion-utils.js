/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */
class MotionUtils {
	static follow(follower, target, strength, distance) {
		const dx = target[0] - follower[0];
		const dy = target[1] - follower[1];
		const dz = target[2] - follower[2];
		const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

		if (dist > distance) {
			follower[0] += dx * strength;
			follower[1] += dy * strength;
			follower[2] += dz * strength;
		}
	}

	static getNormalDirection(turn, dx, dz) {
		const array = MotionUtils.tempArray;
	    const dist = Math.sqrt(dx*dx + dz*dz);
		if (dist > 0) {
		    const sin = Math.sin(turn);
		    const cos = Math.cos(turn);
		    array[0] = cos * dx / dist - sin * dz / dist;
		    array[1] = sin * dx / dist + cos * dz / dist;
		} else {
			array[0] = 0;
			array[1] = 0;
		}
		return array;
	}
}
MotionUtils.tempArray = [ 0, 0 ];
