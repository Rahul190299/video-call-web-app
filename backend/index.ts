
import http from "http";
import { UserManager } from "./UserManager";
import { Socket } from "socket.io";


const express = require('express');
const {Server} = require('socket.io');
const port = process.env.PORT || 3000
var app = express();

const server = http.createServer(http);
const io = new Server(server, {
	cors: {
	  origin: "*"
	}
  });
const userManager = new UserManager();

// make connection with user from server side
io.on('connection',
	(socket : Socket) => {
		console.log('New user connected');
		//console.log(userManager);
		//emit message from server to user
		userManager.addUser("randomuser",socket);
		// listen for message from user
		

		// when server disconnects from user
		socket.on('disconnect',
			() => {
				console.log('disconnected from user');
			});
	});

console.log("server listning on port "+port);

server.listen(port);
