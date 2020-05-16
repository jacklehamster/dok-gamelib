const http = require('http')
const socket = require('socket.io');

function serveSocket(app) {
	const server = http.createServer(app);
	const io = socket(server);

	io.on('connection', (socket) => {
		console.log('a user connected');
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
		socket.on('chat message', (msg) => {
		    io.emit('chat message', msg);
		});
		io.emit('chat message', 'Connected.');
	});	
	return { io, server };
}

module.exports = {
	serveSocket,
};
