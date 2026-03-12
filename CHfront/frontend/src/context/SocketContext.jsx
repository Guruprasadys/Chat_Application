import { createContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = JSON.parse(localStorage.getItem("chatAppUser")) || {};
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    if (socketRef.current) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      socket.emit("setup", { _id: user._id });
    });

    socket.on("online_users", (users) => setOnlineUsers(users));
    socket.on("disconnect", () => console.log("🔴 Disconnected"));
    socket.on("connect_error", (err) =>
      console.error("❌ Connection error:", err.message)
    );

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};