const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/********************************************************************
 * SEARCH USERS (for contact selector)
 ********************************************************************/
router.get("/search", auth, async (req, res) => {
  try {
    const keyword = req.query.search?.trim();

    if (!keyword) {
      return res.status(400).json({ message: "Search keyword required" });
    }

    // Debugging: log request info
    console.log("Search keyword:", keyword);
    console.log("Current user ID:", req.user?._id);

    const users = await User.find({
      // Exclude the current user directly (no need to wrap in ObjectId again)
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword.toString(), $options: "i" } },
      ],
    }).select("-password");

    console.log("Found users:", users.length);

    res.json(users);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
