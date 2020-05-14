/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */



const cache = {};

class Utils {
	static clear3(vector) {
		vector[0] = vector[1] = vector[2] = 0;
		return vector;
	}

	static set3(vector, x, y, z) {
		vector[0] = x;
		vector[1] = y;
		vector[2] = z;
		return vector;
	}

	static set4(vector, a, b, c, d) {
		vector[0] = a;
		vector[1] = b;
		vector[2] = c;
		vector[3] = d;
		return vector;
	}

	static equal3(vector, x, y, z) {
		return vector[0] === x && vector[1] === y && vector[2] === z;
	}

	static equal4(vector, a, b, c, d) {
		return vector[0] === a && vector[1] === b && vector[2] === c && vector[3] === d;
	}

	static getDOMColor(color) {
		return `#${(0x1000000 | color).toString(16).substr(1)}`;		
	}

	static getFromArray(array, index) {
		return array[(index % array.length + array.length) % array.length];
	}
	
	static load(urls, {progress, complete, error}) {
		const progresses = urls.map(() => 0);
		const images = urls.map(() => null);
		const errors = urls.map(() => null);
		let imageLoading = 0;

		const checkCompletion = () => {
			if (imageLoading) {
				return;
			}
			for (let i = 0; i < images.length; i++) {
				if (!images[i] && !errors[i]) {
					return;
				}
			}
			if (errors.filter(a => a).length > 0) {
				error(errors.filter(a => a));
			} else {
				complete(images);
			}
		};

		urls.forEach((url, index) => {
			const shouldLoad = !cache[url];
			if (cache[url] && cache[url].result) {
				images[index] = cache[url].result;
				checkCompletion();
				return;
			}
		    const req = cache[url] ? cache[url].req : new XMLHttpRequest();
		    if (!cache[url]) {
		    	cache[url] = { req };
		    }
		    req.open('GET', url);
	        req.responseType = 'blob';

		    req.addEventListener('load', e => {
				if (req.status === 200) {
					if (url.match(/.(jpg|jpeg|png|gif)$/i)) {
						const imageURL = URL.createObjectURL(req.response);
						const image = new Image();
						imageLoading++;
						image.addEventListener("load", e => {
							URL.revokeObjectURL(imageURL);
							imageLoading --;
							checkCompletion();
						});
						cache[url].result = image;
						image.src = imageURL;
						images[index] = image;
					} else {
						cache[url].result = req.response;
						images[index] = cache[url].result;
						checkCompletion();
					}
				}
				else {
					cache[url].error = Error(req.statusText);
					errors[index] = cache[url].error;
					checkCompletion();
				}
		    });
		    req.addEventListener('error', e => {
		    	cache[url].error = Error("Network Error");
		    	errors[index] = cache[url].error;
				checkCompletion();
		    });
		    req.addEventListener('progress', e => {
		    	progresses[index] = e.loaded / e.total;
		    	progress(progresses.reduce((avg, num, _, {length}) => avg + 100 * num / length, 0));
		    });

		    if (shouldLoad) {
			    req.send();
		    }
		});
	}
}