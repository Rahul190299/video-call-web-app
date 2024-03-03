import { Socket } from "socket.io"
import { RoomManager } from "./RoomManger"
interface User{
        
    name : string,
    socket :Socket,
    
}
 class UserManager{
    private users:User[];
    private queue:string[];
    private roomManager: RoomManager;
    constructor(){
        this.users  = [];
        this.queue=[];
        this.roomManager = new RoomManager();
    }

    addUser(name:string,socket:Socket){
        this.users.push({
            name,socket
        });
        console.log("in add user");
        this.queue.push(socket.id);
        console.log(this.queue.length);
        this.clearQueue();
        this.initHandlers(socket);
    }

    RemoveUser(socketId :string){
        this.users= this.users.filter((e) => e.socket.id!==socketId);
    }
    
    clearQueue(){
        if(this.queue.length < 2){
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find((e) => e.socket.id === id1);
        const user2 = this.users.find((e) => e.socket.id === id2);
        
        this.roomManager.createRoom(user1!,user2!);
        

    }
    
    initHandlers(socket: Socket) {
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            console.log("received offer");
            this.roomManager.onOffer(sdp, roomId, socket.id);
        })

        socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}

export {UserManager}