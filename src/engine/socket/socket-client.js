/**
	Dok-gamelib engine

	Description: Game engine for producing web games easily using JavaScript and WebGL
	Author: jacklehamster
	Sourcode: https://github.com/jacklehamster/dok-gamelib
	Year: 2020
 */
const SocketStatus = {
	CONNECTING: 1,
	CONNECTED: 2,
};

class SocketClient {
	constructor(backupServer) {
		this.onConnectListener = [];
		this.onUpdateListener = [];
		this.onReadyListener = [];
		this.sockets = {};
		this.connections = {};
		this.room = null;
		this.id = null;
		this.data = {};
		this.sharedData = {};
		this.ids = [];
		this.pool = new Pool(() => [], array => array.length = 0);
		this.backupServer = backupServer;
		this.registry = {};
		Utils.get(`/socket.info`)
			.then(response => this.onLocalSocketConfirmed(response === "ok"))
			.catch(() => this.onLocalSocketConfirmed(false));
	}

	wrap(name, action) {
		this.registry[name] = action;
		return (...params) => {
			action(...params);
			this.connect("data", socket => {
				socket.emit("action", this.room || null, name, params);
			});
		};
	}

	onLocalSocketConfirmed(localSocketAvailable) {
		this.localSocketAvailable = localSocketAvailable;
		this.importScript(this.localSocketAvailable ? "/socket.io/socket.io.js" : `${this.backupServer}/socket.io/socket.io.js`);
		this.onReadyListener.forEach(callback => callback());
	}

	whenReady(callback) {
		if (this.localSocketAvailable) {
			callback();
		} else {
			this.addEventListener("ready", callback);
		}
	}

	getSharedData(index) {
		if (index === 0) {
			return this.data;
		}
		const id = this.ids[index - 1];
		return this.sharedData[id];
	}

	dataCount() {
		return this.ids.length + 1;
	}

	join(room, now) {
		this.room = room;
		this.connect("data", socket => {
			socket.emit("join", room, this.data);
		});
	}

	leave(room) {
		this.clear();
		this.connect("data", socket => {
			socket.emit("leave", room);
		});		
	}

	clear() {
		if (this.room || this.id) {
			this.ids.length = 0;
			this.room = null;
			this.id = null;
			this.data = {};
			this.sharedData = {};
		}
	}

	update(newData) {
		const updates = SocketClient.createUpdateBatch(newData, this.data, this.pool);
		SocketClient.applyBatch(updates, this.data);
		if (updates.length) {
			this.connect("data", socket => {
				socket.emit("update", this.room || null, updates);
			});
		}

		this.pool.reset();
	}

	importScript(src) {
		if (self.importScripts) {
			self.importScripts(src);
		} else {
			const script = document.createElement("script");
			script.src = src;
			document.body.appendChild(script);
		}
	}

	addEventListener(type, callback) {
		const listener = this.getListeners(type);
		listener.push(callback);
	}

	removeEventListener(type, callback) {
		const listener = this.getListeners(type);
		const index = listener.indexOf(callback);
		listener.splice(index, 1);
	}

	getListeners(type) {
		switch(type) {
			case "connect":
				return this.onConnectListener;
			case "update":
				return this.onUpdateListener;
			case "ready":
				return this.onReadyListener;
		}
	}

	static dataEquals(newData, oldData) {
		if (newData === null ) {
			return oldData === newData;
		}
		if (Array.isArray(newData)) {
			if (!Array.isArray(oldData) || newData.length !== oldData.length) {
				return false;
			}
			for (let i = 0; i < newData.length; i++) {
				if (!SocketClient.dataEquals(newData[i], oldData[i])) {
					return false;
				}
			}
		} else if (typeof(newData) === "object") {
			if (typeof(oldData) !== "object") {
				return false;
			}
			for (let i in newData) {
				if (!SocketClient.dataEquals(newData[i], oldData[i])) {
					return false;
				}
			}
		}
		return oldData === newData;
	}

	static createUpdateBatch(newData, oldData, pool) {
		const batch = pool.get(true);
		for (let i in oldData) {
			if (typeof(newData[i])==='undefined') {
				batch.push([i]);
			}
		}
		for (let i in newData) {
			if (!SocketClient.dataEquals(newData[i], oldData[i])) {
				const pair = pool.get(true);
				pair[0] = i;
				pair[1] = newData[i];
				batch.push(pair);
			}
		}
		return batch;
	}

	static applyBatch(updates, data) {
    	for (let i = 0; i < updates.length; i++) {
    		const pair = updates[i];
    		if (pair.length === 1) {
    			delete data[field];
    		} else {
				const [ field, value ] = pair;
				data[field] = SocketClient.assignData(data[field], value);
    		}
    	}	
	}

	static assignData(to, from) {
		if (Array.isArray(from)) {
			if (!Array.isArray(to)) {
				to = [];
			}
			to.length = from.length;
			for (let i = 0; i < from.length; i++) {
				to[i] = SocketClient.assignData(to[i], from[i]);
			}
		} else if (typeof(from) === "object" && from !== null) {
			if (typeof(to) !== "object") {
				to = {};
			}
			for (let i in to) {
				if (typeof(from[i])==='undefined') {
					delete to[i];
				}
			}
			for (let i in from) {
				to[i] = SocketClient.assignData(to[i], from[i]);
			}
		} else {
			to = from;
		}
		return to;
	}

	onDataUpdated(id) {
    	for (let i = 0; i < this.onUpdateListener.length; i++) {
    		this.onUpdateListener[i](id, this.sharedData[id]);
    	}		
	}

	connect(namespace, callback) {
		if (this.connections[namespace] === SocketStatus.CONNECTED) {
			callback(this.sockets[namespace]);
		} else if (this.connections[namespace] === SocketStatus.CONNECTING) {
			this.addEventListener("connect", callback);
		} else {
			this.connections[namespace] = SocketStatus.CONNECTING;
			this.addEventListener("connect", callback);

			this.whenReady(() => {
				const socket = this.sockets[namespace] = this.localSocketAvailable ? io(`/${namespace||""}`) : io(`${this.backupServer}/${namespace||""}`);
				this.onConnectListener.forEach(listener => listener(socket, namespace));
				this.onConnectListener.length = 0;
				this.connections[namespace] = SocketStatus.CONNECTED;

			    socket.on('connected', () => console.log("Connected."));

			    socket.on('update', (id, updates) => {
			    	if (this.sharedData[id]) {
				    	SocketClient.applyBatch(updates, this.sharedData[id]);
				    	this.onDataUpdated(id);
			    	}
			    });

			    socket.on('action', (id, name, params) => {
			    	if (this.registry[name]) {
			    		this.registry[name].apply(null, params);
			    	}
			    });

			    socket.on('joined', (id, data) => {
			    	if (!this.sharedData[id]) {
			    		this.ids.push(id);
			    	}
			    	this.sharedData[id] = data;
			    	this.onDataUpdated(id);
			    	socket.emit("welcome", id, this.data);
			    });

			    socket.on("welcome", (id, data) => {
			    	console.log("welcome", id, data);
			    	if (!this.sharedData[id]) {
			    		this.ids.push(id);
			    	}
			    	this.sharedData[id] = data;
			    	this.onDataUpdated(id);
			    });

			    socket.on('self-joined', id => {
			    	console.log("self-joined", id);
			    	this.id = id;
			    });

			    socket.on('left', id => {
			    	if (this.sharedData[id]) {
				    	delete this.sharedData[id];
				    	for (let i = 0; i < this.ids.length; i++) {
				    		if (this.ids[i] === id) {
				    			this.ids[i] = this.ids[this.ids.length - 1];
				    			this.ids.pop();
				    			break;
				    		}
				    	}
				    	this.onDataUpdated(id);
			    	}
			    });
			});
		}
	}
}
