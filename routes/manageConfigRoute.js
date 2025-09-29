
const express = require("express");
const router = express.Router();
const RestaurantConfig = require("../models/ManageConfig");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// Get restaurant configuration
router.get("/", async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId is required" });
    }
    const config = await RestaurantConfig.findOne({ restaurantId });
    res.status(200).json(
      config || {
        showTableNumber: false,
        showRoomNumber: false,
        isTableNumberRequired: false,
        isRoomNumberRequired: false,
        isNameRequired: false,
        isMobileNumberRequired: false,
        tableNumbers: [],
        roomNumbers: [],
        phoneNumber: "",
        allowMultipleTableSelection: false,
        logoUrl: "",
        upiId: "",
        beneficiaryName: "",
        paymentMobileNumber: "",
        placeOrder:true
      }
    );
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// Update restaurant configuration
router.put(
  "/",
  authMiddleware,
  permissionMiddleware("restaurantConfig"),
  async (req, res) => {
    try {
      const {
        showTableNumber,
        showRoomNumber,
        isTableNumberRequired,
        isRoomNumberRequired,
        isNameRequired,
        isMobileNumberRequired,
        tableNumbers,
        roomNumbers,
        phoneNumber,
        allowMultipleTableSelection,
        logoUrl,
        upiId,
        beneficiaryName,
        paymentMobileNumber,
        placeOrder
      } = req.body;

      const restaurantId = req.body.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }
      let config = await RestaurantConfig.findOne({ restaurantId });
      if (!config) {
        config = new RestaurantConfig({ restaurantId });
      }

      // Update all configuration fields
      config.showTableNumber = showTableNumber;
      config.placeOrder = placeOrder;
      config.showRoomNumber = showRoomNumber;
      config.isTableNumberRequired = isTableNumberRequired;
      config.isRoomNumberRequired = isRoomNumberRequired;
      config.isNameRequired = isNameRequired;
      config.isMobileNumberRequired = isMobileNumberRequired;
      config.tableNumbers = Array.isArray(tableNumbers)
        ? tableNumbers
        : (tableNumbers || "").split("\n").filter(Boolean);
      config.roomNumbers = Array.isArray(roomNumbers)
        ? roomNumbers
        : (roomNumbers || "").split("\n").filter(Boolean);
      config.phoneNumber = phoneNumber || "";
      config.allowMultipleTableSelection = allowMultipleTableSelection || false;
      config.logoUrl = logoUrl || "";
      config.upiId = upiId || "";
      config.beneficiaryName = beneficiaryName || "";
      config.paymentMobileNumber = paymentMobileNumber || "";

      await config.save();

      res.status(200).json({
        message: "Configuration updated successfully",
        config: {
          ...config.toObject(),
          showTableNumber: config.showTableNumber,
          placeOrder: config.placeOrder,
          showRoomNumber: config.showRoomNumber,
          isTableNumberRequired: config.isTableNumberRequired,
          isRoomNumberRequired: config.isRoomNumberRequired,
          isNameRequired: config.isNameRequired,
          isMobileNumberRequired: config.isMobileNumberRequired,
          tableNumbers: config.tableNumbers,
          roomNumbers: config.roomNumbers,
          phoneNumber: config.phoneNumber,
          allowMultipleTableSelection: config.allowMultipleTableSelection,
          logoUrl: config.logoUrl,
          upiId: config.upiId,
          beneficiaryName: config.beneficiaryName,
          paymentMobileNumber: config.paymentMobileNumber,
        },
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        error: "Failed to update configuration",
        details: error.message,
      });
    }
  }
);

module.exports = router;

