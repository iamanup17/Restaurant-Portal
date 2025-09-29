// // routes/manageConfigRoute.js
// const express = require("express");
// const router = express.Router();
// const RestaurantConfig = require("../models/ManageConfig");
// const authMiddleware = require("../middleware/authMiddleware");
// const permissionMiddleware = require("../middleware/permissionMiddleware");

// // Get restaurant configuration
// router.get("/", async (req, res) => {
//   try {
//     const config = await RestaurantConfig.findOne();
//     res.status(200).json(
//       config || {
//         showTableNumber: false,
//         showRoomNumber: false,
//         isTableNumberRequired: false,
//         isRoomNumberRequired: false,
//         tableNumbers: [],
//         roomNumbers: [],
//         phoneNumber: "",
//         allowMultipleTableSelection: false,
//         logoUrl: "",
//         upiId: "",
//         beneficiaryName: "",
//         paymentMobileNumber: "",
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching config:", error);
//     res.status(500).json({ error: "Failed to fetch configuration" });
//   }
// });

// // Update restaurant configuration
// router.put(
//   "/",
//   authMiddleware,
//   permissionMiddleware("restaurantConfig"),
//   async (req, res) => {
//     try {
//       const {
//         showTableNumber,
//         showRoomNumber,
//         isTableNumberRequired,
//         isRoomNumberRequired,
//         tableNumbers,
//         roomNumbers,
//         phoneNumber,
//         allowMultipleTableSelection,
//         logoUrl,
//         upiId,
//         beneficiaryName,
//         paymentMobileNumber,
//       } = req.body;

//       let config = (await RestaurantConfig.findOne()) || new RestaurantConfig();

//       // Update all configuration fields
//       config.showTableNumber = showTableNumber;
//       config.showRoomNumber = showRoomNumber;
//       config.isTableNumberRequired = isTableNumberRequired;
//       config.isRoomNumberRequired = isRoomNumberRequired;
//       config.tableNumbers = Array.isArray(tableNumbers)
//         ? tableNumbers
//         : (tableNumbers || "").split("\n").filter(Boolean);
//       config.roomNumbers = Array.isArray(roomNumbers)
//         ? roomNumbers
//         : (roomNumbers || "").split("\n").filter(Boolean);
//       config.phoneNumber = phoneNumber || "";
//       config.allowMultipleTableSelection = allowMultipleTableSelection || false;
//       config.logoUrl = logoUrl || "";

//       // Update payment details
//       config.upiId = upiId || "";
//       config.beneficiaryName = beneficiaryName || "";
//       config.paymentMobileNumber = paymentMobileNumber || "";

//       await config.save();

//       res.status(200).json({
//         message: "Configuration updated successfully",
//         config: {
//           ...config.toObject(),
//           // Explicitly include all fields in response
//           showTableNumber: config.showTableNumber,
//           showRoomNumber: config.showRoomNumber,
//           isTableNumberRequired: config.isTableNumberRequired,
//           isRoomNumberRequired: config.isRoomNumberRequired,
//           tableNumbers: config.tableNumbers,
//           roomNumbers: config.roomNumbers,
//           phoneNumber: config.phoneNumber,
//           allowMultipleTableSelection: config.allowMultipleTableSelection,
//           logoUrl: config.logoUrl,
//           upiId: config.upiId,
//           beneficiaryName: config.beneficiaryName,
//           paymentMobileNumber: config.paymentMobileNumber,
//         },
//       });
//     } catch (error) {
//       console.error("Update error:", error);
//       res.status(500).json({
//         error: "Failed to update configuration",
//         details: error.message,
//       });
//     }
//   }
// );

// module.exports = router;


// 3 august 

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


// order segregation 

// const express = require("express");
// const router = express.Router();
// const RestaurantConfig = require("../models/ManageConfig");
// const authMiddleware = require("../middleware/authMiddleware");
// const permissionMiddleware = require("../middleware/permissionMiddleware");

// // Get restaurant configuration
// router.get("/", async (req, res) => {
//   try {
//     const config = await RestaurantConfig.findOne();
//     res.status(200).json(
//       config || {
//         dineIn: {
//           showTableNumber: false,
//           isTableNumberRequired: false,
//           showRoomNumber: false,
//           isRoomNumberRequired: false,
//           isNameRequired: false,
//           isMobileNumberRequired: false,
//           tableNumbers: [],
//           roomNumbers: [],
//           allowMultipleTableSelection: false,
//         },
//         quickOrder: {
//           isNameRequired: false,
//           isMobileNumberRequired: false,
//         },
//         homeDelivery: {
//           isNameRequired: false,
//           isMobileNumberRequired: false,
//           isAddressRequired: false,
//         },
//         phoneNumber: "",
//         logoUrl: "",
//         upiId: "",
//         beneficiaryName: "",
//         paymentMobileNumber: "",
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching config:", error);
//     res.status(500).json({ error: "Failed to fetch configuration" });
//   }
// });

// // Update restaurant configuration
// router.put(
//   "/",
//   authMiddleware,
//   permissionMiddleware("restaurantConfig"),
//   async (req, res) => {
//     try {
//       const {
//         dineIn,
//         quickOrder,
//         homeDelivery,
//         phoneNumber,
//         logoUrl,
//         upiId,
//         beneficiaryName,
//         paymentMobileNumber,
//       } = req.body;

//       let config = (await RestaurantConfig.findOne()) || new RestaurantConfig();

//       // Update configuration fields
//       config.dineIn = {
//         showTableNumber: dineIn?.showTableNumber ?? config.dineIn.showTableNumber,
//         isTableNumberRequired: dineIn?.isTableNumberRequired ?? config.dineIn.isTableNumberRequired,
//         showRoomNumber: dineIn?.showRoomNumber ?? config.dineIn.showRoomNumber,
//         isRoomNumberRequired: dineIn?.isRoomNumberRequired ?? config.dineIn.isRoomNumberRequired,
//         isNameRequired: dineIn?.isNameRequired ?? config.dineIn.isNameRequired,
//         isMobileNumberRequired: dineIn?.isMobileNumberRequired ?? config.dineIn.isMobileNumberRequired,
//         tableNumbers: Array.isArray(dineIn?.tableNumbers)
//           ? dineIn.tableNumbers
//           : (dineIn?.tableNumbers || "").split("\n").filter(Boolean),
//         roomNumbers: Array.isArray(dineIn?.roomNumbers)
//           ? dineIn.roomNumbers
//           : (dineIn?.roomNumbers || "").split("\n").filter(Boolean),
//         allowMultipleTableSelection: dineIn?.allowMultipleTableSelection ?? config.dineIn.allowMultipleTableSelection,
//       };
//       config.quickOrder = {
//         isNameRequired: quickOrder?.isNameRequired ?? config.quickOrder.isNameRequired,
//         isMobileNumberRequired: quickOrder?.isMobileNumberRequired ?? config.quickOrder.isMobileNumberRequired,
//       };
//       config.homeDelivery = {
//         isNameRequired: homeDelivery?.isNameRequired ?? config.homeDelivery.isNameRequired,
//         isMobileNumberRequired: homeDelivery?.isMobileNumberRequired ?? config.homeDelivery.isMobileNumberRequired,
//         isAddressRequired: homeDelivery?.isAddressRequired ?? config.homeDelivery.isAddressRequired,
//       };
//       config.phoneNumber = phoneNumber || "";
//       config.logoUrl = logoUrl || "";
//       config.upiId = upiId || "";
//       config.beneficiaryName = beneficiaryName || "";
//       config.paymentMobileNumber = paymentMobileNumber || "";

//       await config.save();

//       res.status(200).json({
//         message: "Configuration updated successfully",
//         config: config.toObject(),
//       });
//     } catch (error) {
//       console.error("Update error:", error);
//       res.status(500).json({
//         error: "Failed to update configuration",
//         details: error.message,
//       });
//     }
//   }
// );

// module.exports = router;