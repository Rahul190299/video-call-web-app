import { Socket } from "socket.io";

let ROOM_ID:number= 1;

interface User{
        
    name : string,
    socket :Socket,
    
}
interface Room{   
   user1:User,
   user2:User   
}


 class RoomManager{
    private rooms: Map<string, Room>;
    constructor(){
        this.rooms = new Map();
    }

    createRoom(user1:User,user2:User){
        console.log(user1 +" "+ user2);
       if(user1 == undefined || user2 == undefined){
        return ;
       }
       console.log("in create room");
       const roomId = this.Generate().toString();
       this.rooms.set(roomId,{user1,user2});
       user1.socket.emit('send-offer',{roomId});
       user2.socket.emit('send-offer',{roomId});

    }

    Generate(){
        return ROOM_ID++;
    }
    onOffer(sdp:string,roomId:string,senderSocketId:string){
        const room =this.rooms.get(roomId);
        console.log(roomId + " " + room);
        console.log(sdp);
        if(!room){
            return ;
        }
        console.log("in room manager on offer");
        const otherUser:User = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

        otherUser.socket.emit('offer', {
            sdp,roomId
        })
    }

    onAnswer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;

        receivingUser?.socket.emit("answer", {
            sdp,
            roomId
        });
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }

}

export {RoomManager}