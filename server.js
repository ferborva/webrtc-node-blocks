'use strict';

const express = require('express');
const socketio = require('socket.io');
const ss = require('socket.io-stream');
const http = require('http');
const uuid = require('node-uuid');

const app = express();
const server = http.createServer(app);

app.use(express.static(`${__dirname}/public/`));

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on port ${port}`);

const socketServer = socketio.listen(server, { log: false });

let users = new Set();

socketServer.on('connection', (socket) => {

	users.add(socket);
    console.log('New user connected');

    console.log(`There are ${users.size} users connected`);

    socket.on('videoBlob', function(blob) {
    	socket.broadcast.emit('newVideoBlob', blob);
    });

    // ss(socket).on('video', function(inStream, data) {
    // 	// const outStream = ss.createStream();
    	// users.forEach((consumerSocket) => {
    	// 	if (consumerSocket !== socket) {
    	// 		ss(consumerSocket).emit('newVideoEmitted', inStream);
    	// 	}
    	// });
    // 	// inStream.pipe(outStream);
    // 	console.log('Start Broadcasting!');
    // });

    socket.on('disconnect', () => {
    	users.delete(socket);
    	console.log(`There are ${users.size} users connected`);
    })
});
