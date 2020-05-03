/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
	SceneRefresher
  */


class SceneRefresher {
	init(game) {
		const { init } = game;
		init.run();
	}

	refresh(scene) {
		const refreshRate = scene.refreshRate.get();
		if (refreshRate && scene.now - scene.lastRefresh < 1000 / refreshRate) {
			return;
		}
		scene.refresh.run();
		scene.lastRefresh = scene.now;
	}
}