import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";


interface IData {
    email : string; 
    roomId : string;
}

const Lobby: React.FC = () => {


    const [roomId, setRoomID] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const socket = useSocket();
    console.log(socket);
    const navigate = useNavigate();

    const handleJoinRoom = useCallback((data : IData) =>  {
        const {roomId}  = data;
        navigate(`/room/${roomId}`);
    }, [socket, navigate]);

    const handleJoinBtnCallClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (!roomId) throw new Error('Enter Room ID');

        if (!email) throw new Error('Enter Email');

        const data : IData= {
            email: email,
            roomId: roomId
        }

        //event to join room
        socket?.emit("join-room", data);
    }
    useEffect(() => {
        socket?.on("join-room", handleJoinRoom)

        return (() => {
            socket?.off("join-room", handleJoinRoom)
        })
    }, [socket]);

    return (<>
        <div className="h-screen w-screen flex justify-center items-center">
            <div className="relative flex flex-col mx-2 my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96 h-96">
                <div className="p-4">
                    <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                        Website Review Check Update from Our Team in San Francisco
                    </h5>
                    <p className="text-slate-600 leading-normal font-light">
                        The place is close to Barceloneta Beach and bus stop just 2 min by walk and near to Naviglio where you can enjoy the main night life in Barcelona.
                    </p>

                    <button className="rounded-md bg-slate-800 py-2 px-4 mt-6 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                        Create Call
                    </button>
                </div>
            </div>

            <div className="relative flex flex-col my-6 mx-2 bg-white shadow-sm border border-slate-200 rounded-lg w-96 h-96">
                <div className="p-4">
                    <h5 className="mb-2 text-slate-800 text-xl font-semibold">
                        Website Review Check Update from Our Team in San Francisco
                    </h5>
                    <div className="flex flex-col gap-4 p-6">
                        <div className="w-full max-w-sm min-w-[200px]">
                            <label className="block mb-2 text-sm text-slate-600">
                                Enter Room ID
                            </label>
                            <input type="text" className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="xxxx-xxxx-xxxx" onChange={(e) => setRoomID(e.target.value)} />
                        </div>
                        <div className="w-full max-w-sm min-w-[200px]">
                            <label className="block mb-2 text-sm text-slate-600">
                                Email
                            </label>
                            <input type="email" className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Your Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <button className="rounded-md bg-slate-800 py-2 px-4 mt-6 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button" onClick={(e) => handleJoinBtnCallClick(e)}>
                            Join Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default Lobby;