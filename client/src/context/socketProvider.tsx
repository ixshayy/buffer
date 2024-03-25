import {createContext, useMemo, useContext, ReactNode} from "react";
import { Socket, io } from "socket.io-client";

interface SocketProviderProps {
    children: ReactNode;
}

const socketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    const socket = useContext(socketContext);
    return socket;
};

export const SocketProvider = (props : SocketProviderProps ) => {
    const socket = useMemo( () => io("http://localhost:3000"), []);
    return(<socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>)
}   