var  port = 8000,
     express = require('express'),
     server = express.createServer(),
     io = require('socket.io').listen(server),
     chat = io.of('/chat'),
     canvas = io.of('/canvas')
     ;

     server.listen(port);
	 
     server.get(/(^\/.*$)/, function(request, response) {
		     var fileName = request.params[0];
		     if (fileName == '/')
				fileName = '/index.html';
		     response.sendfile(__dirname + '/client' + fileName);
		     });
io.sockets.on('connection', function(socket) {
		socket.on('setName', function (name,pass) {
			var FTPClient = require('./node_modules/ftp'),  conn;
			conn = new FTPClient({ host: 'vyom.cc.iitk.ac.in' });
			//console.log(pass);
			//console.log(name);
			var flag=0;
			conn.on('connect', function() {
				  //socket.emit('wait');
				  conn.auth(name,pass,function(e) {
				    try {
					 if (e)
					   throw e;
					else
						flag=1;
				    }
				    catch(e)
				    {console.log("error");
					socket.emit('retry');}
				});
			if(flag!=1)
			  socket.emit('wait');
			conn.end();
			});
			conn.connect();
			if(flag===1)
			{
			  socket.emit('success');
			  console.log("login success");
			  socket.emit('done', name);
		    }
			socket.on('done', function(name) {
			console.log('hello');
			socket.set('name', name);
			socket.broadcast.emit('receive', {
				sender:'Server',
				message:name + ' has joined.'
					})
			});
		});

socket.on('send', function (message) {
		socket.get('name', function(error, name) {
			if (name)
			socket.broadcast.emit('receive', {
sender:name,
message:message
})
			})
		});

socket.on('draw', function (command) {
		io.sockets.emit('draw', command)
		});

socket.on('updateCursor', function(position) {
		socket.get('name', function(error, name) {
			if (name)
			socket.broadcast.emit('updateCursor', {
name:name,
position:position
});
			});
		});

socket.on('disconnect', function() {
		socket.get('name', function(error, name) {
			if (name) {
			socket.broadcast.emit('receive', {
sender:'Server',
message:name + ' has left.'
});
			socket.broadcast.emit('removeCursor', name);
			}
			})
		});
});