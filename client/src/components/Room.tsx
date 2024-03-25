import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "../context/socketProvider";
import ReactPlayer from "react-player";
import PeerService from "../utils/peerService";

interface IEUserRoom {
  email: string;
  socketId: string;
}

interface IEIncomingCall {
  from: string;
  offer: RTCSessionDescriptionInit | undefined;
}

interface IECallUser {
  to: string;
  offer: RTCSessionDescriptionInit | undefined;
}

interface IEAcceptedCall {
  from: string;
  ans: RTCSessionDescription | undefined;
}

export const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string>("");


  const handleJoinUser = useCallback((data: IEUserRoom) => {
    console.log(`${data.email} joined room`);
    console.log("user socket id", data, data.socketId);
    setRemoteSocketId(data.socketId);
  }, []);


  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const peer = new PeerService();
  const peer = useMemo(() => {
    return new PeerService();
  }, []);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMyStream(stream);
    const offer = await peer.getOffer();
    const calluserData: IECallUser = {
      to: remoteSocketId,
      offer: offer,
    };

    console.log("calluserData", calluserData);
    socket?.emit("call:user", calluserData);
    // console.log("stream", stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async (data: IEIncomingCall) => {
      setRemoteSocketId(data.from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("Incoming Call", "from", data.from, "offer", data.offer);
      const ans = await peer.getAnswer(data.offer);
      socket?.emit("call:accepted", { to: data.from, ans: ans });
    },
    [socket]
  );

  const addStreamTracks = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.getPeer().addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    (data: IEAcceptedCall) => {
      if (data && data.ans) {
        peer.setLocalDescription(data.ans);
        console.log("call accepted");

        addStreamTracks();
      }
    },
    [addStreamTracks]
  );


  const handleInitNegotiation = useCallback(async ()=>{
    const offer = await peer.getOffer();
    // const data = {
    //   to: remoteSocketId,
    //   offer: offer,
    // };
    console.log("init negotiation", remoteSocketId)
    socket?.emit("negotiate:peer", {
      to: remoteSocketId,
      offer: offer,
    });
  }, [remoteSocketId, socket])

  const handleIncomingNegotiation = useCallback(async (data: IEIncomingCall) => {
    console.log("handle incomeing call", data.from);
    const ans = await peer.getAnswer(data.offer);
    console.log("handle inc 2", ans);
    socket?.emit("negotiation:done", {
      to: data.from,
      ans: ans,
    });
  }, [socket]);


  const handleFinalNegotiation = useCallback(async (data: IEAcceptedCall) => {
    console.log("final");
    await peer.setLocalDescription(data.ans);
    console.log("handled final negotiaion");
  }, []); 

  useEffect(() => {
    peer.getPeer().addEventListener("negotiationneeded", handleInitNegotiation);
    return () => {
      peer
        .getPeer()
        .removeEventListener("negotiationneeded", handleInitNegotiation);
    };
  }, [handleInitNegotiation]);

  useEffect(() => {
    // const peerConnection = peer.getPeer();

    console.log("peer xconnect")

    peer.getPeer().addEventListener("track", (ev) => {
        const stream = ev.streams;
        console.log("streams :: ", stream[0]);
        setRemoteStream(stream[0]);
      });
  }, []);
  

  useEffect(() => {
    socket?.on("join:user", handleJoinUser);
    socket?.on("call:incoming", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("negotiate:peer", handleIncomingNegotiation);
    socket?.on("negotiate:final", handleFinalNegotiation);
    return () => {
      socket?.off("join:user", handleJoinUser);
      socket?.off("call:incoming", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("negotiate:peer", handleIncomingNegotiation);
      socket?.off("negotiate:final", handleFinalNegotiation);
    };
  }, [socket, handleJoinUser, handleIncomingCall, handleCallAccepted, handleIncomingNegotiation, handleFinalNegotiation]);

  return (
    <div>
      <h2> THIS IS ROOM PAGE</h2>
      <h4>{remoteSocketId ? "connected" : "no one in room"}</h4>
      {remoteSocketId ? (
        <button
          onClick={handleCallUser}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Call
        </button>
      ) : null}

    {myStream ? (
        <button
          onClick={addStreamTracks}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add stream
        </button>
      ) : null}
      {myStream ? (
        <><h2>My stream</h2><ReactPlayer
        className="w-full aspect-video md:aspect-square"
        playing
        url={myStream}
        muted
      /></>
      ) : null}

      {remoteStream ? (
        <>
        <h2>Remote Stream</h2>
        <ReactPlayer
          className="w-full aspect-video md:aspect-square"
          playing
          url={remoteStream}
          muted
        />
        </>
      ) : null}
    </div>
  );
};
