/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */


class INewgroundsWrapper {
    unlockMedal(medal_name) {
        throw new Error("Need to override this function.");
    }

    postScore(score) {
        throw new Error("Need to override this function.");
    }
}