require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

/* ================== MODELS ================== */
const Message = require("./models/Message");
const User = require("./models/User");
const Chat = require("./models/Chat");
const Invitation = require("./models/Invitation");

/* ================== ROUTES ================== */
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================== DATABASE ================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ================== ROUTES ================== */
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/invitations", invitationRoutes);

/* ================== SOCKET SERVER ================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

/* ================== ONLINE USERS TRACKER ================== */
let onlineUsers = {}; // { userId: socketId }

/* ================== SOCKET.IO LOGIC ================== */
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  /* -------- USER SETUP -------- */
  socket.on("setup", (userData) => {
    if (!userData?._id) return;

    socket.join(userData._id);
    onlineUsers[userData._id] = socket.id;

    io.emit("online_users", Object.keys(onlineUsers));
  });

  /* -------- JOIN CHAT ROOM -------- */
  socket.on("join_chat", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log("✅ SOCKET JOINED ROOM:", chatId);
  });

  /* -------- SEND MESSAGE -------- */
  socket.on("send_message", async (messageData) => {
    try {
      // If you want to ensure DB save here, uncomment:
      // const newMessage = await Message.create(messageData);

      // Broadcast to everyone in the chat room
      io.to(messageData.chat).emit("receive_message", messageData);

      console.log("📩 Message broadcasted to chat:", messageData.chat);
    } catch (err) {
      console.error("Error handling send_message:", err);
    }
  });

  /* -------- INVITE REAL-TIME NOTIFICATION -------- */
  socket.on("send_invite_notification", (receiverId, inviteData) => {
    if (onlineUsers[receiverId]) {
      io.to(receiverId).emit("new_invite", inviteData);
    }
  });

  socket.on("invite_accepted_notification", (senderId, chatData) => {
    if (onlineUsers[senderId]) {
      io.to(senderId).emit("invite_accepted", chatData);
    }
  });

  /* -------- TYPING INDICATOR -------- */
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing");
  });

  socket.on("stop_typing", (chatId) => {
    socket.to(chatId).emit("stop_typing");
  });

  /* -------- DISCONNECT -------- */
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }

    io.emit("online_users", Object.keys(onlineUsers));
  });
});

/* ================== START SERVER ================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);