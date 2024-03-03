import { useState,useRef, useEffect } from "react"

import { Room } from "./Room";

export const Landing = () => {
    const [name,setName] =useState("");
    const [joined,setJoined] = useState<boolean>(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    async function getCam(){
        const stream = await window.navigator.mediaDevices.getUserMedia(
            {video : true, audio : true}
        )
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        setLocalAudioTrack(audioTrack);
        setlocalVideoTrack(videoTrack);
        if(!videoRef.current){
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack]);
        videoRef.current.play();
    }
    useEffect(() => {
        if(videoRef && videoRef.current){
            getCam();
        }
    },[videoRef])
    if(!joined){
        return <div>
        <video autoPlay ref={videoRef}></video>
        <input type="text" onChange={(e) => {
            setName(e.target.value);
        }}>
        </input>
        <button onClick={() => {
            setJoined(true);
        }}>Join</button>
    </div>
    }

    return <div><Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/></div>
    


}