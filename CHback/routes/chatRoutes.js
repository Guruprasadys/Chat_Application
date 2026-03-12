const express = require("express");
const Chat = require("../models/Chat");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/********************************************************************
 * GET ALL CHATS FOR LOGGED-IN USER
 ********************************************************************/
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic phoneNumber",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email profilePic phoneNumber",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);

  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

/********************************************************************
 * CREATE GROUP CHAT (BASED ON PHONE NUMBERS)
 ********************************************************************/
router.post("/group", auth, async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || members.length < 1) {
      return res.status(400).json({
        message: "Group name and at least one member are required",
      });
    }

    // Remove duplicate phone numbers
    const uniquePhoneNumbers = [...new Set(members)];

    // Find users by phone numbers
    const usersFromDB = await User.find({
      phoneNumber: { $in: uniquePhoneNumbers },
    });

    if (usersFromDB.length !== uniquePhoneNumbers.length) {
      return res.status(400).json({
        message: "One or more phone numbers are not registered",
      });
    }

    // Convert to user IDs
    const userIds = usersFromDB.map((user) => user._id);

    // Add current user if not included
    if (!userIds.some(id => id.toString() === req.user._id.toString())) {
      userIds.push(req.user._id);
    }

    // Create group chat
    const group = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: userIds,
      groupAdmin: req.user._id,
    });

    // Fully populate before sending response
    const fullGroup = await Chat.findById(group._id)
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic phoneNumber",
      });

    res.status(201).json(fullGroup);

  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Group creation failed" });
  }
});

module.exports = router;