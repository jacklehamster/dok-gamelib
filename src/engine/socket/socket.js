class Socket {
	constructor() {
		this.backupServer = 'https://dobuki.herokuapp.com/';
		this.onConnectListener = [];
		this.onSceneListener = [];
		this.onUpdateListener = [];
		this.sockets = {};
		this.connections = {};

		Utils.get('/socket.info').then(response => {
			this.importScript(response === "ok" ? "/socket.io/socket.io.js" : "https://dobuki.herokuapp.com/socket.io/socket.io.js");
		});
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
			case "scene":
				return this.onSceneListener;
			case "update":
				return this.onUpdateListener;
		}
	}

	connect(namespace, callback) {
		if (this.connections[namespace] === Socket.CONNECTED) {
			callback(this.sockets[namespace]);
		} else if (this.connections[namespace] === Socket.CONNECTING) {
			this.addEventListener("connect", callback);
		} else {
			this.connections[namespace] = Socket.CONNECTING;
			this.addEventListener("connect", callback);
			Utils.get('/socket.info').then(response => {
				const socket = this.sockets[namespace] = response === "ok" ? io(`/${namespace||""}`) : io.connect(`${this.backupServer}${namespace||""}`);
				this.onConnectListener.forEach(listener => listener(socket, namespace));
				this.onConnectListener.length = 0;
				this.connections[namespace] = Socket.CONNECTED;

				socket.on('chat message', msg => {
					console.log(msg);
			    });

			    socket.on('data', (id, msg) => {
					console.log("data", id, msg);
			    	for (let i = 0; i < this.onUpdateListener.length; i++) {
			    		this.onUpdateListener[i](id, msg);
			    	}
			    });

			    socket.on('joined', id => {
					console.log("joined", id);
			    	for (let i = 0; i < this.onSceneListener.length; i++) {
			    		this.onSceneListener[i]("joined", id);
			    	}
			    });

			    socket.on('self-joined', id => {
			    	console.log("self-joined", id);
			    });

			    socket.on('left', id => {
					console.log("left", id);
			    	for (let i = 0; i < this.onSceneListener.length; i++) {
			    		this.onSceneListener[i]("left", id);
			    	}
			    });

			    socket.on('connected', () => console.log("Connected."));
			});
		}
	}

	join(room) {
		this.connect("data", socket => {
			socket.emit("join", room);
		});
	}

	leave(room) {
		this.connect("data", socket => {
			socket.emit("leave", room);
		});		
	}

	updateData(data, id) {
		this.connect("data", socket => {
			socket.emit("data", id || null, data);
		});
	}

	send(msg) {
		this.connect(null, socket => {
			socket.emit('chat message', msg);
		});
	}
}

Socket.CONNECTING = 1;
Socket.CONNECTED = 2;
