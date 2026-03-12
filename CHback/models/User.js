const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String }, // optional if using phone as primary
  phoneNumber: { type: String, required: true, unique: true }, // new
  password: { type: String, required: true },
  profilePic: { type: String }
});

module.exports = mongoose.model("User", userSchema);