import {
  FormEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSocket } from "../context/socketProvider";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

interface IERoom {
  email: string;
  roomId: string;
}

export const Home = () => {
  const [email, setEmail] = useState<string>("");
  const [userJoinEmail, setJoinuUserEmail] = useState<string>("");
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const socket = useSocket();
  const handleCreateRoom: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    console.log(socket);
    socket?.emit("join:room", {
      email: email,
      roomId: uuidv4(),
    });
  };

  const handleUserJoinRoom: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    socket?.emit("join:room", {
      email: userJoinEmail,
      roomId: roomId,
    });
  };

  const handleJoinRoom = useCallback((data: IERoom) => {
    const { email, roomId } = data;
    console.log("handle room join, ", roomId, email);
    navigate(`room/${roomId}`);
  }, []);

  useEffect(() => {
    socket?.on("join:room", handleJoinRoom);
  }, [socket]);

  return (
    <>
      <div className="h-full w-screen">
        <div className="h-full w-full bg-gray-100 flex items-center">
          <form className="w-full max-w-lg ml-5">
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-slate-400 rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-mail"
                  type="email"
                  placeholder="Enter email id"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-red-500 text-xs italic">
                Please enter email id.
              </p>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <button
                  className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-3 px-4 mb-3 rounded focus:outline-none focus:shadow-outline "
                  type="submit"
                  onClick={handleCreateRoom}
                >
                  Create Room
                </button>
              </div>
              <div className="w-full md:w-1/2 px-3">
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-slate-400 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-roomcode"
                  type="text"
                  placeholder="Enter Code"
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <p className="text-red-500 text-xs italic">
                Please enter room id.
              </p>
                <div className="flex justify-end">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded"
                    onClick={handleUserJoinRoom}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
