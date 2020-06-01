/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class WorkerNewgrounds extends INewgroundsWrapper {
    constructor(communicator) {
        super();
        this.communicator = communicator;
    }

    unlockMedal(medal_name) {
        this.communicator.sendCommand(Commands.NG_UNLOCK_MEDAL, medal_name);
    }

    postScore(score) {
        this.communicator.sendCommand(Commands.NG_UNLOCK_MEDAL, score);
    }
}