
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

	static equal3(vector, x, y, z) {
		return vector[0] === x && vector[1] === y && vector[2] === z;
	}
	
	static load(... urls) {
		return urls.length > 1 ? Promise.all(urls.map(Utils.load)) : new Promise((resolve, reject) => {
			const url = urls[0];
			if (cache[url] && cache[url].result) {
				if (cache[url].result) {
					resolve(cache[url].result);
				} else {
					reject(cache[url].error);
				}
				return;
			}

			const shouldLoad = !cache[url];
			if (url.match(/.(jpg|jpeg|png|gif)$/i)) {
				const img = cache[url] ? cache[url].img : new Image();
				img.crossOrigin = "anonymous";
				if (!cache[url]) {
					cache[url] = { img };					
				}
				img.addEventListener('load', e => {
					cache[url].result = e.currentTarget;
					resolve(cache[url].result);
				});
			    img.addEventListener('error', e => {
			    	cache[url].error = Error("Image Error");
			      	reject(cache[url].error);
			    });
			    if (shouldLoad) {
					img.src = url;
			    }
			} else {
			    const req = cache[url] ? cache[url].req : new XMLHttpRequest();
			    if (!cache[url]) {
			    	cache[url] = { req };
			    }
			    req.open('GET', url);
			    req.addEventListener('load', e => {
			      if (req.status === 200) {
			      	cache[url].result = req.response;
			        resolve(cache[url].result);
			      }
			      else {
			      	cache[url].error = Error(req.statusText);
			        reject(cache[url].error);
			      }
			    });
			    req.addEventListener('error', e => {
			    	cache[url].error = Error("Network Error");
			    	reject(cache[url].error);
			    });
			    if (shouldLoad) {
				    req.send();
			    }
			}
		});
	}
}