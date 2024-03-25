import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

interface IERoom {
  email : string, 
  roomId : string
}
export const Home = () => {
  const [email, setEmail] = useState<string>("");
  const [userJoinEmail, setJoinuUserEmail] = useState<string>("");
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const socket = useSocket();
  const handleCreateRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(socket);
    socket?.emit("join:room", {
      email: email,
      roomId: uuidv4(),
    });
  };

  const handleUserJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("join:room", {
      email : userJoinEmail, 
      roomId : roomId
    })
  }

  const handleJoinRoom  = useCallback((data: IERoom) => {
    const {email, roomId} = data;
    console.log("handle room join, ", roomId, email);
    navigate(`room/${roomId}`);
  }, []);


  useEffect(()=>{
    socket?.on("join:room", handleJoinRoom)
  }, [socket]);

  return (
    <div>

      {/* //create room */}
      <div className="w-full max-w-xs">
     
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleCreateRoom}
        >
           <p className="text-center text-gray-500 text-xs">Create Room</p>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="roomid"
            >
              Room id
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="roomid"
              type="text"
              placeholder="Enter Room id"
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div> */}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Room
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy;2020 Acme Corp. All rights reserved.
        </p>
      </div>



      {/* //join room */}
      <div className="w-full max-w-xs">
     
     <form
       className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
       onSubmit={handleUserJoinRoom}
     >
        <p className="mb-3 text-gray-500 dark:text-gray-400">Join Room</p>
       <div className="mb-4">
         <label
           className="block text-gray-700 text-sm font-bold mb-2"
           htmlFor="email"
         >
           email
         </label>
         <input
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
           id="email"
           type="email"
           placeholder="email"
           onChange={(e) => setJoinuUserEmail(e.target.value)}
         />
       </div>
       <div className="mb-4">
         <label
           className="block text-gray-700 text-sm font-bold mb-2"
           htmlFor="roomid"
         >
           Room id
         </label>
         <input
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
           id="roomid"
           type="text"
           placeholder="Enter Room id"
           onChange={(e) => setRoomId(e.target.value)}
         />
       </div>
       <div className="flex items-center justify-between">
         <button
           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
           type="submit"
         >
           Enter Room
         </button>
       </div>
     </form>
     <p className="text-center text-gray-500 text-xs">
       &copy;2020 Acme Corp. All rights reserved.
     </p>
   </div>

    </div>
  );
};
