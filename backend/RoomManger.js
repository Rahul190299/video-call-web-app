"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        console.log(user1 + " " + user2);
        if (user1 == undefined || user2 == undefined) {
            return;
        }
        console.log("in create room");
        const roomId = this.Generate().toString();
        this.rooms.set(roomId, { user1, user2 });
        user1.socket.emit('send-offer', { roomId });
        user2.socket.emit('send-offer', { roomId });
    }
    Generate() {
        return ROOM_ID++;
    }
    onOffer(sdp, roomId, senderSocketId) {
        const room = this.rooms.get(roomId);
        console.log(roomId + " " + room);
        console.log(sdp);
        if (!room) {
            return;
        }
        console.log("in room manager on offer");
        const otherUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        otherUser.socket.emit('offer', {
            sdp, roomId
        });
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
}
exports.RoomManager = RoomManager;
