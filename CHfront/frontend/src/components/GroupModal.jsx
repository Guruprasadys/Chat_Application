import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function GroupModal({ close, refreshChats }) {

  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [members, setMembers] = useState("");

  const createGroup = async () => {

    try {

      const phoneNumbers = members
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p !== "");

      const { data } = await axios.post(
        "http://localhost:5000/api/chats/group",
        {
          name,
          members: phoneNumbers,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      refreshChats(data);
      close();

    } catch (err) {

      alert(err.response?.data?.message || "Group creation failed");

    }

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-96 p-6 rounded-xl shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Create Group
        </h2>

        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="text"
          placeholder="Member phone numbers (comma separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={close}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={createGroup}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Create
          </button>

        </div>

      </div>

    </div>

  );

}