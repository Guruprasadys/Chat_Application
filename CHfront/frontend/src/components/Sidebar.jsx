import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import GroupModal from "./GroupModal";

export default function Sidebar({ setSelectedChat }) {

  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invites, setInvites] = useState([]);

  const [showGroupModal, setShowGroupModal] = useState(false);

  /* ================= FETCH CHATS ================= */

  const fetchChats = useCallback(async () => {

    if (!user?.token) return;

    try {

      const { data } = await axios.get(
        "http://localhost:5000/api/chats",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setChats(data);

    } catch (err) {

      console.error("Failed to load chats:", err);

    }

  }, [user?.token]);

  useEffect(() => {

    fetchChats();

  }, [fetchChats]);

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {

    if (!socket) return;

    socket.on("group_created", (chat) => {

      setChats((prev) => [chat, ...prev]);

    });

    return () => {

      socket.off("group_created");

    };

  }, [socket]);

  /* ================= SEARCH USERS ================= */

  useEffect(() => {

    if (!search.trim()) {

      setSearchResults([]);
      return;

    }

    const delay = setTimeout(async () => {

      try {

        const { data } = await axios.get(
          `http://localhost:5000/api/users/search?search=${search}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setSearchResults(data);

      } catch (err) {

        console.error(err);

      }

    }, 400);

    return () => clearTimeout(delay);

  }, [search, user?.token]);

  /* ================= CREATE GROUP ================= */

  const addNewGroup = (group) => {

    setChats((prev) => [group, ...prev]);

  };

  /* ================= GET OTHER USER ================= */

  const getOtherUser = (chat) => {

    if (!chat?.users) return null;

    const loggedUserId = user?._id || user?.user?._id;

    return chat.users.find(
      (u) => u._id !== loggedUserId
    );

  };

  return (

    <div className="w-1/3 h-full bg-white border-r flex flex-col">

      {/* HEADER */}

      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">

        <h2 className="font-bold text-lg text-gray-800">
          Chats
        </h2>

        <button
          onClick={() => setShowGroupModal(true)}
          className="px-4 py-1 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          + Group
        </button>

      </div>

      {/* SEARCH */}

      <div className="p-3 border-b">

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-full border focus:outline-none"
        />

      </div>

      {/* CHAT LIST */}

      <div className="flex-1 overflow-y-auto">

        {chats.map((chat) => {

          const otherUser = !chat.isGroupChat
            ? getOtherUser(chat)
            : null;

          return (

            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
            >

              <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-bold">

                {chat.isGroupChat
                  ? "G"
                  : otherUser?.name?.charAt(0) || "U"}

              </div>

              <div className="ml-3 flex-1">

                <p className="font-semibold">

                  {chat.isGroupChat
                    ? chat.chatName
                    : otherUser?.name}

                </p>

                <p className="text-sm text-gray-500 truncate">

                  {chat.latestMessage?.content ||
                    "No messages yet"}

                </p>

              </div>

            </div>

          );

        })}

      </div>

      {/* GROUP MODAL */}

      {showGroupModal && (

        <GroupModal
          close={() => setShowGroupModal(false)}
          refreshChats={addNewGroup}
        />

      )}

    </div>

  );

}