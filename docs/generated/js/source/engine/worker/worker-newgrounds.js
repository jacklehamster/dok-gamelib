/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class WorkerNewgrounds extends INewgroundsWrapper {
    constructor(engineCommunicator) {
        super();
        this.engineCommunicator = engineCommunicator;
    }

    unlockMedal(medal_name) {
        this.engineCommunicator.sendCommand(Commands.NG_UNLOCK_MEDAL, null, [medal_name]);
    }

    postScore(score) {
        this.engineCommunicator.sendCommand(Commands.NG_POST_SCORE, [score]);
    }
}