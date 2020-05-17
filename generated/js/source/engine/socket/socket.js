class Socket {
	constructor() {
		this.backupServer = 'https://dobuki.herokuapp.com/';
		this.onConnectListener = [];
		this.connection = Socket.OFFLINE;
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
		}
	}

	connect(callback) {
		if (this.connection === Socket.CONNECTED) {
			callback(this.socket);
		} else if (this.connection === Socket.CONNECTING) {
			this.addEventListener("connect", callback);
		} else {
			this.connection = Socket.CONNECTING;
			this.addEventListener("connect", callback);
			Utils.get('/socket.info').then(response => {
		  		this.socket = response === "ok" ? io() : io.connect(this.backupServer);
				this.onConnectListener.forEach(listener => {
					listener(this.socket);
				});
				this.onConnectListener.length = 0;
				this.connection = Socket.CONNECTED;

				this.socket.on('chat message', (msg) => {
					console.log(msg);
			    });
			});
		}
	}

	send(msg) {
		this.connect(socket => {
			socket.emit('chat message', msg);
		});
	}
}

Socket.OFFLINE = 0;
Socket.CONNECTING = 1;
Socket.CONNECTED = 2;
