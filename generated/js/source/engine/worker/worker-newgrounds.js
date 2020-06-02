/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class WorkerNewgrounds extends INewgroundsWrapper {
    constructor(bufferTransport) {
        super();
        this.bufferTransport = bufferTransport;
    }

    unlockMedal(medal_name) {
        this.bufferTransport.sendCommand(Commands.NG_UNLOCK_MEDAL, medal_name);
    }

    postScore(score) {
        this.bufferTransport.sendCommand(Commands.NG_UNLOCK_MEDAL, score);
    }
}