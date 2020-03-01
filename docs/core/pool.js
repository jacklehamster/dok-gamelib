/**
  *	  class Pool
  */

class Pool {
	constructor(createCall, initCall) {
		this.createCall = createCall;
		this.initCall = initCall;
		this.pool = [];
		this.index = 0;
		Pool.pools.push(this);
	}

	get() {
		if (this.index >= this.pool.length) {
			this.pool.push(this.createCall());
		}
		const value = this.pool[this.index];
		if (this.initCall) {
			this.initCall(value);
		}
		this.index++;
		return value;
	}

	reset() {
		this.index = 0;
	}

	static resetAll() {
		Pool.pools.forEach(pool => pool.reset());
	}
}
Pool.pools = [];
