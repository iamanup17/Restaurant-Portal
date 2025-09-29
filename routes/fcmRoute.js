const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken"); // Add JWT

// Store FCM token
router.post("/store-token", async (req, res) => {
  try {
    const { fcmToken, adminToken } = req.body; // Get token from body

    if (!fcmToken || !adminToken) {
      return res.status(400).json({ 
        message: "FCM token and admin token are required" 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
    const adminId = decoded.id;

    // Add token to admin's document
    await Admin.findByIdAndUpdate(
      adminId,
      { $addToSet: { fcmTokens: fcmToken } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Token stored successfully" });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ 
      message: "Failed to store token", 
      error: error.message 
    });
  }
});

// Remove FCM token
router.post("/remove-token", async (req, res) => {
  try {
    const { fcmToken, adminToken } = req.body;

    if (!fcmToken || !adminToken) {
      return res.status(400).json({ 
        message: "FCM token and admin token are required" 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
    const adminId = decoded.id;

    await Admin.findByIdAndUpdate(
      adminId,
      { $pull: { fcmTokens: fcmToken } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Token removed successfully" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ 
      message: "Failed to remove token", 
      error: error.message 
    });
  }
});

module.exports = router;