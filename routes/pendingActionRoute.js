// const express = require("express");
// const PendingAction = require("../models/PendingAction");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get all unhandled pending actions
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const pendingActions = await PendingAction.find({ handled: false }).populate("orderId");
//     res.status(200).json(pendingActions);
//     console.log("first" , pendingActions)
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Create a pending action (called by frontend)
// router.post("/create", async (req, res) => {
//   try {
//     const { orderId, actionType } = req.body;
//     if (!orderId || !["newOrder", "orderUpdated"].includes(actionType)) {
//       return res.status(400).json({ message: "Invalid orderId or actionType" });
//     }
//     const newPendingAction = new PendingAction({ orderId, actionType });
//     await newPendingAction.save();
//     res.status(201).json({ message: "Pending action created" });
//   } catch (err) {
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Mark a pending action as handled
// router.put("/accept/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedAction = await PendingAction.findByIdAndUpdate(
//       id,
//       { handled: true },
//       { new: true }
//     );
//     if (!updatedAction) {
//       return res.status(404).json({ message: "Pending action not found" });
//     }
//     res.status(200).json({ message: "Pending action handled" });
//   } catch (err) {
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// module.exports = router;


// pendingActionRoute.js

// const express = require("express");
// const PendingAction = require("../models/PendingAction");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get all unhandled pending actions
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const pendingActions = await PendingAction.find({ handled: false }).populate("orderId");
//     res.status(200).json(pendingActions);
//     console.log("first", pendingActions);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Create a pending action
// router.post("/create", async (req, res) => {
//   try {
//     const { orderId, actionType } = req.body;
//     if (!orderId || !["newOrder", "orderUpdated"].includes(actionType)) {
//       return res.status(400).json({ message: "Invalid orderId or actionType" });
//     }
//     const newPendingAction = new PendingAction({ orderId, actionType });
//     await newPendingAction.save();
//     res.status(201).json({ message: "Pending action created" });
//   } catch (err) {
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Mark a pending action as handled
// router.put("/accept/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedAction = await PendingAction.findByIdAndUpdate(
//       id,
//       { handled: true },
//       { new: true }
//     );
//     if (!updatedAction) {
//       return res.status(404).json({ message: "Pending action not found" });
//     }
//     res.status(200).json({ message: "Pending action handled" });
//   } catch (err) {
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// module.exports = router;

// pendingActionRoute.js

const express = require("express");
const PendingAction = require("../models/PendingAction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all unhandled pending actions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pendingActions = await PendingAction.find({ handled: false }).populate("orderId");
    res.status(200).json(pendingActions);
    console.log("first", pendingActions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a pending action
router.post("/create", async (req, res) => {
  try {
    const { orderId, actionType } = req.body;
    if (!orderId || !["newOrder", "orderUpdated"].includes(actionType)) {
      return res.status(400).json({ message: "Invalid orderId or actionType" });
    }
    const newPendingAction = new PendingAction({ orderId, actionType });
    await newPendingAction.save();
    res.status(201).json({ message: "Pending action created" });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Mark a pending action as handled
router.put("/accept/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAction = await PendingAction.findByIdAndUpdate(
      id,
      { handled: true },
      { new: true }
    );
    if (!updatedAction) {
      return res.status(404).json({ message: "Pending action not found" });
    }
    res.status(200).json({ message: "Pending action handled" });
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

module.exports = router;