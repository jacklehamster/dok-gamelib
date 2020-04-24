/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class FollowUtils {
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
}