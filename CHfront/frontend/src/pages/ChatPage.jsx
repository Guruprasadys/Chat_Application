import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />

        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} user={user} />
        ) : (
          <div className="flex-1 flex justify-center items-center text-gray-400 text-lg">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}