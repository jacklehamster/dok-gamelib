/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */

class TimeScheduler {
	constructor() {
		this.slotPeriod = 1000;
		this.timeSlot = 0;
		this.schedules = {};
		this.iteratorRoot = { next: null };

		this.pool = new Pool(() => { return {}; }, schedule => {
			schedule.time = 0;
			schedule.next = null;
			schedule.action = null;
		});
	}

	clear() {
		this.timeSlot = 0;
		this.schedules = {};
		this.iteratorRoot.next = null;
		this.pool.reset();
	}

	scheduleAt(time, action) {
		const slot = Math.floor(time / this.slotPeriod);
		const schedule = this.pool.get(true);
		schedule.time = time;
		schedule.action = action;
		schedule.next = this.schedules[slot];
		this.schedules[slot] = schedule;
	}

	cleanSchedule(slot) {
		const { schedules, pool } = this;
		if (schedules[slot]) {
			while (schedules[slot]) {
				const dump = schedules[slot];
				schedules[slot] = schedules[slot].next;
				pool.recycle(dump, true);
			}
			delete schedules[slot];
		}
	}

	process(now) {
		const slot = Math.floor(now / this.slotPeriod);
		if (slot !== this.timeSlot) {
			this.cleanSchedule(this.timeSlot);
			this.timeSlot = slot;
		}

		const { schedules, iteratorRoot, pool } = this;
		if (schedules[slot]) {
			iteratorRoot.next = schedules[slot];

			let elem = iteratorRoot;
			while(elem.next) {
				if (now >= elem.next.time) {
					//	process schedule
					const schedule = elem.next;
					elem.next = schedule.next;
					schedule.action();
					pool.recycle(schedule, true);
				} else {
					elem = elem.next;
				}
			}
			schedules[slot] = iteratorRoot.next;
			if (!schedules[slot]) {
				delete schedules[slot];
			}
		}
	}
}