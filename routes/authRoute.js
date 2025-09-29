// routes/authRoute.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password, restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const admin = await Admin.findOne({ username, restaurantId });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id, restaurantId, permissions: admin.permissions }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: admin._id, restaurantId, permissions: admin.permissions }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// refresh token

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({ token: newToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

module.exports = router;
