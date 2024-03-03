"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManger_1 = require("./RoomManger");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManger_1.RoomManager();
    }
    addUser(name, socket) {
        this.users.push({
            name, socket
        });
        console.log("in add user");
        this.queue.push(socket.id);
        console.log(this.queue.length);
        this.clearQueue();
        this.initHandlers(socket);
    }
    RemoveUser(socketId) {
        this.users = this.users.filter((e) => e.socket.id !== socketId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find((e) => e.socket.id === id1);
        const user2 = this.users.find((e) => e.socket.id === id2);
        this.roomManager.createRoom(user1, user2);
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("received offer");
            this.roomManager.onOffer(sdp, roomId, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}
exports.UserManager = UserManager;
