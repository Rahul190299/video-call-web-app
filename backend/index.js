"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const UserManager_1 = require("./UserManager");
const express = require('express');
const { Server } = require('socket.io');
const port = process.env.PORT || 3000;
var app = express();
const server = http_1.default.createServer(http_1.default);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
const userManager = new UserManager_1.UserManager();
// make connection with user from server side
io.on('connection', (socket) => {
    console.log('New user connected');
    //console.log(userManager);
    //emit message from server to user
    userManager.addUser("randomuser", socket);
    // listen for message from user
    // when server disconnects from user
    socket.on('disconnect', () => {
        console.log('disconnected from user');
    });
});
console.log("server listning on port " + port);
server.listen(port);
