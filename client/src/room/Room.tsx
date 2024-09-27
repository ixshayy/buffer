import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import PeerService from '../service/PeerService';

interface IData {
    email: string,
    socketId: string
}


const Room: React.FC = () => {

    const socket = useSocket();
    const [remoteSocketID, setRemoteSocketId] = useState("");
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream>();

    const handleNewUserJoin = (data: IData) => {
        const { email, socketId } = data;
        setRemoteSocketId(socketId);
        console.log("email socket room", email, socketId)
    }

    const hanldeCallUser = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        const offer = await PeerService.getOffer();

        socket?.emit("call-user", { to: remoteSocketID, offer });

        setMyStream(stream);
    }

    const handleIncomingCall = async (data: any) => {
        const { from, offer } = data;
        setRemoteSocketId(from);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);

        console.log("incoming call from", from, offer);

        const ans = await PeerService.getAnswer(offer);
        socket?.emit("call-accepted", { to: from, ans });
    }

    const sendStreams = () => {

        if (!myStream) {
            console.log("no my stream");
            return;
        }

        for (const track of myStream.getTracks()) {
            PeerService.peer.addTrack(track, myStream);
        }

    }

    const handleCallAccepted = (data: any) => {
        const { from, ans } = data;
        PeerService.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
    }

    const handleNegotiationNeedIncomming = async (data: any) => {
        const { from, offer } = data;
        const ans = await PeerService.getAnswer(offer);
        socket?.emit("peer:nego:done", { to: from, ans });
    }

    const handleNegotiationNeedFinal = async (ans: RTCSessionDescriptionInit) => {
        await PeerService.setLocalDescription(ans);
    }

    useEffect(() => {
        PeerService.peer.addEventListener("track", async (ev) => {
            const stream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(stream[0]);
        });
    }, []);


    useEffect(() => {
        socket?.on("new-user-join", handleNewUserJoin);
        socket?.on("incoming-call", handleIncomingCall);
        socket?.on("call:accepted", handleCallAccepted);
        socket?.on("peer:nego:needed", handleNegotiationNeedIncomming);
        socket?.on("peer:nego:final", handleNegotiationNeedFinal);


        return (() => {
            socket?.off("new-user-join", handleNewUserJoin);
            socket?.off("incoming-call", handleIncomingCall);
            socket?.off("call:accepted", handleCallAccepted);
            socket?.off("peer:nego:needed", handleNegotiationNeedIncomming);
            socket?.off("peer:nego:final", handleNegotiationNeedFinal);
        })
    }, [socket, handleNewUserJoin, handleIncomingCall, handleCallAccepted , handleNegotiationNeedIncomming, handleNegotiationNeedFinal])

    return (<>
        <h1>Room page</h1>
        <h1>{remoteSocketID ? "connected" : "not in room"}</h1>
        {remoteSocketID && <button onClick={hanldeCallUser}>CALL</button>}
        {myStream && <>
            <h1>My stream </h1>
            <ReactPlayer playing muted height="500px" width="500px" url={myStream} />
        </>}
        {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="500px"
            url={remoteStream}
          />
        </>
      )}
    </>)
}


export default Room;