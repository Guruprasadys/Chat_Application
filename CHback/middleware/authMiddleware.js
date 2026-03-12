// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  try {
    // 1️⃣ Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // 2️⃣ Extract token
      token = req.headers.authorization.split(" ")[1];

      // 3️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Get user id (supports both id and _id)
      const userId = decoded.id || decoded._id;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      // 5️⃣ Fetch full user from DB (exclude password)
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 6️⃣ Attach user to request
      req.user = user;

      next();
    } else {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid or expired token, authorization denied" });
  }
};

module.exports = protect;