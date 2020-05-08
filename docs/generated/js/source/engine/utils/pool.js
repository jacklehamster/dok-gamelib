/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */


/**
  *	  class Pool
  */

class Pool {
	constructor(createCall, initCall) {
		this.createCall = createCall;
		this.initCall = initCall;
		this.pool = [];
		this.recycler = [];
		this.index = 0;
		Pool.pools.push(this);
	}

	recycle(element, init) {
		if (init && this.initCall) {
			this.initCall(element);
		}
		this.recycler.push(element);
	}

	get(init) {
		if (this.recycler.length) {
			return this.recycler.pop();
		}

		if (this.index >= this.pool.length) {
			this.pool.push(this.createCall());
		}
		const value = this.pool[this.index];
		if (init && this.initCall) {
			this.initCall(value);
		}
		this.index++;
		return value;
	}

	reset() {
		this.index = 0;
	}
}
Pool.pools = [];
