import React from "react";

export default function MessageBubble({ message, currentUser }) {

  const currentUserId =
    currentUser?._id || currentUser?.user?._id;

  const senderId =
    typeof message.sender === "object"
      ? message.sender._id
      : message.sender;

  const isSender =
    message.isTemp ||
    senderId?.toString() === currentUserId?.toString();

  const fileUrl =
    message.content?.startsWith("/uploads")
      ? `http://localhost:5000${message.content}`
      : null;

  const isImage =
    fileUrl &&
    message.content.match(/\.(jpeg|jpg|png|gif|webp)$/i);

  const isVideo =
    fileUrl &&
    message.content.match(/\.(mp4|webm|mov)$/i);

  const isFile =
    fileUrl && !isImage && !isVideo;

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  return (

    <div
      className={`flex w-full mb-4 items-end ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >

      {/* Avatar */}

      {!isSender && (
        <img
          src={
            message.sender?.profilePic
              ? `http://localhost:5000${message.sender.profilePic}`
              : "/photo.png"
          }
          alt="avatar"
          className="w-9 h-9 rounded-full mr-2 shadow-md"
        />
      )}

      <div className="max-w-sm flex flex-col">

        {/* Sender Name */}

        {!isSender && (
          <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">
            {message.sender?.name || "User"}
          </span>
        )}

        {/* Bubble */}

        <div
          className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
            isSender
              ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-br-none"
              : "bg-white text-gray-800 border rounded-bl-none"
          }`}
        >

          {/* IMAGE */}

          {isImage && (
            <img
              src={fileUrl}
              alt="uploaded"
              className="max-w-xs rounded-lg mb-2 shadow"
            />
          )}

          {/* VIDEO */}

          {isVideo && (
            <video
              controls
              className="max-w-xs rounded-lg mb-2 shadow"
            >
              <source src={fileUrl} />
            </video>
          )}

          {/* FILE */}

          {isFile && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
                isSender
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-blue-600"
              }`}
            >
              📎 Download File
            </a>
          )}

          {/* TEXT MESSAGE */}

          {!fileUrl && (
            <span className="text-[15px] font-semibold leading-relaxed tracking-wide">
              {message.content}
            </span>
          )}

          {/* TIME + TICKS */}

          <div
            className={`flex items-center gap-1 text-[10px] mt-2 ${
              isSender
                ? "text-gray-200 justify-end"
                : "text-gray-400 justify-end"
            }`}
          >

            <span className="font-medium">{time}</span>

            {isSender && (
              <span className="text-xs font-bold">
                ✓✓
              </span>
            )}

          </div>

        </div>

      </div>

    </div>

  );

}