const http = require('http')
const socket = require('socket.io');

function serveSocket(app) {
	const server = http.createServer(app);
	const io = socket(server);

	app.get('/socket.info', (req, res) => {
		res.send("ok");
	});

	io.of('/data').on('connection', client => {		
	  	client.on('join', (room, data) => {
	  		client.join(room, () => {
	  			client.to(room).emit('joined', client.id, data);
	  			client.emit("self-joined", client.id);
	  		});
			client.on('disconnect', () => {
				io.of('/data').to(room).emit('left', client.id);
			});
	  	});

	  	client.on('action', (room, name, params) => {
	  		client.to(room).emit('action', client.id, name, params);
	  	});

	  	client.on('leave', room => {
	  		client.leave(room, () => {
	  			io.of('/data').to(room).emit('left', client.id);
	  		});
	  	});

	    client.on('update', (room, updates) => {
    		client.to(room).emit('update', client.id, updates);
	    });

	    client.on('remove', (room, field) => {
    		client.to(room).emit('remove', client.id, field);
	    });

	    client.on('welcome', (id, data) => {
	    	client.to(id).emit("welcome", client.id, data);
	    });
	  });

	return { io, server };
}

module.exports = {
	serveSocket,
};
