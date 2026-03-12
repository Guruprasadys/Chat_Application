const express = require("express");
const mongoose = require("mongoose");
const Invitation = require("../models/Invitation");
const Chat = require("../models/Chat");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/********************************************************************
 * SEND INVITATION
 ********************************************************************/
router.post("/send", protect, async (req, res) => {
  try {
    // Extra safety check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { receiverId } = req.body;

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Valid receiverId required" });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    // Check if private chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, receiverId] },
    });

    if (existingChat) {
      return res.status(400).json({ message: "Chat already exists" });
    }

    // Check existing pending invitation
    const existingInvite = await Invitation.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    const invite = await Invitation.create({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json(invite);
  } catch (err) {
    console.error("SEND INVITE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/********************************************************************
 * GET RECEIVED INVITATIONS
 ********************************************************************/
router.get("/received", protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const invites = await Invitation.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "name email phoneNumber profilePic");

    res.status(200).json(invites);
  } catch (err) {
    console.error("FETCH INVITES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/********************************************************************
 * ACCEPT INVITATION
 ********************************************************************/
router.put("/accept/:inviteId", protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const invite = await Invitation.findById(req.params.inviteId);

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    invite.status = "accepted";
    await invite.save();

    // Prevent duplicate chat creation
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [invite.sender, invite.receiver] },
    });

   if (existingChat) {
  const fullExistingChat = await Chat.findById(existingChat._id)
    .populate("users", "-password")
    .populate("latestMessage");

  return res.status(200).json({
    message: "Invitation accepted",
    chat: fullExistingChat,
  });
}

    const chat = await Chat.create({
      chatName: "Private Chat",
      isGroupChat: false,
      users: [invite.sender, invite.receiver],
    });

    const fullChat = await Chat.findById(chat._id).populate(
      "users",
      "-password"
    );

    res.status(200).json({
      message: "Invitation accepted",
      chat: fullChat,
    });
  } catch (err) {
    console.error("ACCEPT INVITE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/********************************************************************
 * REJECT INVITATION
 ********************************************************************/
router.put("/reject/:inviteId", protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const invite = await Invitation.findById(req.params.inviteId);

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    invite.status = "rejected";
    await invite.save();

    res.status(200).json({ message: "Invitation rejected" });
  } catch (err) {
    console.error("REJECT INVITE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;