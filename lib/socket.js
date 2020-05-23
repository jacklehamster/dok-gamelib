const http = require('http')
const socket = require('socket.io');

function serveSocket(app) {
	const server = http.createServer(app);
	const io = socket(server);

	io.on('connection', (client) => {
		console.log('a user connected');
		client.on('disconnect', () => {
			console.log('user disconnected');
		});
		client.on('chat message', (msg) => {
		    io.emit('chat message', msg);
		});
		io.emit('chat message', 'Connected.');


	});	

	io.of('/data')
	  .on('connection', client => {
	  	client.on('join', room => {
	  		client.join(room, () => {
	  			client.to(room).emit('joined', client.id);
	  			client.emit("self-joined", client.id);
	  		});
			client.on('disconnect', () => {
				io.of('/data').to(room).emit('left', client.id);
			});
	  	});

	  	client.on('leave', room => {
	  		client.leave(room, () => {
	  			io.of('/data').to(room).emit('left', client.id);
	  		});
	  	});

	    client.on('data', (id, data) => {
	    	if (id) {
	    		client.to(id).emit('data', client.id, data);
	    	} else {
		    	client.broadcast.emit('data', client.id, data);
	    	}
	    });
	  });

	return { io, server };
}

module.exports = {
	serveSocket,
};
