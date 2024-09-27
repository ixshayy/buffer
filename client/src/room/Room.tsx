import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import PeerService from "../service/PeerService";
import "./Room.styles.scss";

// Define the types for your component's state and event data
interface UserJoinedData {
  email: string;
  id: string;
}

interface IncommingCallData {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAcceptedData {
  from: string;
  ans: RTCSessionDescriptionInit;
}

interface NegoNeededData {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface NegoFinalData {
  ans: RTCSessionDescriptionInit;
}

const Room: React.FC = () => {
  const socket = useSocket();

  // Typing for media streams (initially undefined)
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Handle user joined
  const handleUserJoined = useCallback(({ email, id }: UserJoinedData) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  // Handle call user
  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await PeerService.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  // Handle incoming call
  const handleIncommingCall = useCallback(
    async ({ from, offer }: IncommingCallData) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("Incoming Call", from, offer);
      const ans = await PeerService.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // Send streams to remote peer
  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        PeerService.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  // Handle call accepted
  const handleCallAccepted = useCallback(
    ({ from, ans }: CallAcceptedData) => {
      PeerService.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  // Handle negotiation needed
  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;
    const offer = await PeerService.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    PeerService.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      PeerService.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // Handle negotiation needed incoming
  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }: NegoNeededData) => {
      const ans = await PeerService.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  // Handle negotiation final
  const handleNegoNeedFinal = useCallback(async ({ ans }: NegoFinalData) => {
    await PeerService.setLocalDescription(ans);
  }, []);

  // Handle remote stream tracks
  useEffect(() => {
    PeerService.peer.addEventListener("track", (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // Socket event listeners setup
  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incomming:call", handleIncommingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incomming:call", handleIncommingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncomming);
      socket?.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      <div className="flex">
      {myStream && (
        <div className="mx-5">
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="500px"
            url={myStream}
            className="video-player"
          />
        </div>
      )}
      {remoteStream && (
        <div>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="500px"
            url={remoteStream}
            className="video-player"
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default Room;
