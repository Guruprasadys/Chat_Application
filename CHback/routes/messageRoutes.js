const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/********************************************************************
 * SEND MESSAGE (REAL-TIME CHAT ROOM VERSION - FIXED)
 ********************************************************************/
router.post("/", auth, async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({
        message: "Content and chatId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    // ✅ Get chat and populate users
    const chat = await Chat.findById(chatId).populate(
      "users",
      "name email profilePic phoneNumber"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // ✅ Ensure sender is part of chat
    const isUserInChat = chat.users.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({ message: "Not authorized in this chat" });
    }

    /************************************************************
     * 1️⃣ CREATE MESSAGE
     ************************************************************/
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    /************************************************************
     * 2️⃣ POPULATE MESSAGE
     ************************************************************/
    message = await message.populate(
      "sender",
      "name email profilePic phoneNumber"
    );

    message.chat = chat;

    /************************************************************
     * 3️⃣ UPDATE LATEST MESSAGE
     ************************************************************/
    chat.latestMessage = message._id;
    await chat.save();

    /************************************************************
     * 4️⃣ 🔥 REAL-TIME EMISSION TO CHAT ROOM
     ************************************************************/
    const io = req.app.get("io");

    if (io) {
      // Emit to entire chat room
      io.to(chatId.toString()).emit("receive_message", message);
    }

    /************************************************************
     * 5️⃣ RESPONSE TO SENDER
     ************************************************************/
    res.status(201).json(message);

  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Message send failed" });
  }
});

/********************************************************************
 * GET ALL MESSAGES OF A CHAT
 ********************************************************************/
router.get("/:chatId", auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email profilePic phoneNumber")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name email profilePic phoneNumber",
        },
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (err) {
    console.error("Load messages error:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
});

module.exports = router;