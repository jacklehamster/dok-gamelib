/**
  *	  class Pool
  */

class Pool {
	constructor(createCall) {
		this.createCall = createCall;
		this.pool = [];
		this.index = 0;
		Pool.pools.push(this);
	}

	get() {
		if (this.index >= this.pool.length) {
			this.pool.push(this.createCall());
		}
		return this.pool[this.index++]; 
	}

	reset() {
		this.index = 0;
	}

	static resetAll() {
		Pool.pools.forEach(pool => pool.reset());
	}
}
Pool.pools = [];
