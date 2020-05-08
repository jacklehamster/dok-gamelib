/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */
class ColorUtils {
	static toRGB(color) {
		return [
			Math.max(0,Math.min(255,(color >> 16) % 256)),
			Math.max(0,Math.min(255,(color >> 8) % 256)),
			Math.max(0,Math.min(255,color % 256)),
		];
	}

	static fromRGB(red, green, blue) {
		red = Math.max(0, Math.min(255, Math.round(red)));
		green = Math.max(0, Math.min(255, Math.round(green)));
		blue = Math.max(0, Math.min(255, Math.round(blue)));
		return (red << 16) | (green << 8) | blue;
	}
}