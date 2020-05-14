/**
    Dok-gamelib engine

    Description: Game engine for producing web games easily using JavaScript and WebGL
    Author: jacklehamster
    Sourcode: https://github.com/jacklehamster/dok-gamelib
    Year: 2020
 */

 class WorkerSpriteRenderer extends ISpriteRenderer {
	constructor(textureManager, engineCommunicator, spriteProvider, spriteDataProcessor, {imagedata, videos}) {
		super(textureManager, engineCommunicator, spriteProvider, spriteDataProcessor, {imagedata, videos});
 	}
 }