import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io ,Socket} from 'socket.io-client';

export const Room = ({name,localAudioTrack,localVideoTrack}:{name:string,localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,})  =>{
        const [searchParams, setSearchParams] = useSearchParams();
        const [lobby, setLobby] = useState(true);
        const [socket, setSocket] = useState<null | Socket>(null);
        const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
        const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
        const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
        const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
        const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
        const remoteVideoRef = useRef<HTMLVideoElement>();
        const localVideoRef = useRef<HTMLVideoElement>();

    
    useEffect(() => {
        
            const socket = io("http://localhost:3000");
            console.log("in 1st useeffect");
        
        
        socket.on('send-offer',({roomId}) => {
            setLobby(false);
            const pc = new RTCPeerConnection();
            if(localAudioTrack){
                pc.addTrack(localAudioTrack);

            }
            if(localVideoTrack){
                pc.addTrack(localVideoTrack);
            }
            setSendingPc(pc);
            pc.onicecandidate = async (e) => {
                console.log("receving candidate locally");
                if(e.candidate){
                    console.log(e.candidate);
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId
                       })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotition needed, sending offer");
                const sdp = pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp);
                socket.emit("offer", {
                    sdp,
                    roomId
                })

            }
        })
        socket.on("offer",async ({roomId,sdp:remoteSdp}) => {
            setLobby(false);
            console.log("received offer");
            const pc = new RTCPeerConnection();
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)

            pc.setRemoteDescription(remoteSdp);

            const stream = new MediaStream();
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = stream ;  
            }

            setRemoteMediaStream(stream);
            setReceivingPc(pc);
            
            pc.ontrack = async (e) => {
                alert("ontrack");
            }

            pc.onicecandidate = async (e) => {
                if(!e.candidate){
                    return ;
                }
                socket.emit("add-ice-candidate", {
                    type : "receiver",
                    candidate : e.candidate,
                })
            }

            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                if(track1.kind == "video"){
                    setRemoteAudioTrack(track2);
                    setRemoteVideoTrack(track1);
                }
                else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
            }, 5000);
        
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
        })

        socket.on("add-ice-candidate",({candidate,type}) => {
            if(type == "sender"){
                setReceivingPc(pc => {
                    if(!pc){
                        console.log("receiving pc not found");
                    }
                    else{
                        console.log(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;

                });
            }
            else{
                setSendingPc(pc => {
                    if(!pc){
                        console.log("receiving pc not found");
                    }
                    else{
                        console.log(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
                
            }
        })
        setSocket(socket);

        
    },[name])

    useEffect(() => {
        if(localVideoRef.current){
            console.log("inside useeffect localvedioref changed")
            if(localVideoTrack){
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    },[localVideoRef])
    return <div>
        Hi {name}
        <video autoPlay width={400} height={400} ref={localVideoRef} />
        {lobby ? "Waiting to connect you to someone" : null}
        <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
}