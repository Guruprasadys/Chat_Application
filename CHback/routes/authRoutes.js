/********************************************************************
 *  AUTH ROUTES FILE
 *  Handles User Registration & Login
 ********************************************************************/

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); // if you want protected routes
const multer = require("multer");
const path = require("path");

const router = express.Router();

/************************************************************
 * MULTER CONFIG FOR PROFILE PIC UPLOAD
 ************************************************************/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

/********************************************************************
 * @route   POST /api/register
 * @desc    Register new user
 * @access  Public
 ********************************************************************/
router.post("/register", async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
   let profilePic = req.body.profilePic || "";
    // Validate required fields
    if (!name || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, phone number, and password are required"
      });
    }

    // Check if user exists by phone number
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      profilePic
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
});

/********************************************************************
 * @route   POST /api/login
 * @desc    Login user via email or phone number
 * @access  Public
 ********************************************************************/
router.post("/login", async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number and password required"
      });
    }

    // Find user by email or phone
    const user = await User.findOne(
      email ? { email } : { phoneNumber }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});

module.exports = router;