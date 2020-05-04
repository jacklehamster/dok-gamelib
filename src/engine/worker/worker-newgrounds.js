/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class WorkerNewgrounds extends INewgroundsWrapper {
    constructor(engine) {
        super();
        this.engine = engine;
    }

    unlockMedal(medal_name) {
        this.engine.sendCommand("newgrounds", "unlockMedal", medal_name);
    }

    postScore(score) {
        this.engine.sendCommand("newgrounds", "postScore", score);
    }
}