// uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* ================= CREATE UPLOADS FOLDER IF NOT EXISTS ================= */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= STORAGE CONFIG ================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // absolute path to uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

/* ================= MULTER SETUP ================= */
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/* ================= ROUTE ================= */
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(201).json({
    file: `/uploads/${req.file.filename}`,   // URL to access file
    originalName: req.file.originalname,     // original file name
    fileType: req.file.mimetype,             // MIME type
    size: req.file.size,                     // file size in bytes
  });
});

module.exports = router;