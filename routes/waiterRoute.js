// const express = require("express");
// const jwt = require("jsonwebtoken");
// const Waiter = require("../models/Waiter");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get all waiters
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const waiters = await Waiter.find();
//     res.status(200).json(waiters);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// // Add a new waiter
// router.post("/add", authMiddleware, async (req, res) => {
//   try {
//     const { username, password, permissions } = req.body;

//     const existingWaiter = await Waiter.findOne({ username });
//     if (existingWaiter) {
//       return res.status(400).json({ message: "Waiter already exists" });
//     }

//     const waiter = new Waiter({ username, password, permissions });
//     await waiter.save();

//     res.status(201).json({ message: "Waiter added successfully", waiter });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// // Update waiter permissions
// router.put("/update/:id", authMiddleware, async (req, res) => {
//   try {
//     const { permissions } = req.body;
//     const waiter = await Waiter.findByIdAndUpdate(
//       req.params.id,
//       { permissions },
//       { new: true }
//     );

//     if (!waiter) {
//       return res.status(404).json({ message: "Waiter not found" });
//     }

//     res.status(200).json({ message: "Permissions updated", waiter });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// // Delete a waiter
// router.delete("/delete/:id", authMiddleware, async (req, res) => {
//   try {
//     const waiter = await Waiter.findByIdAndDelete(req.params.id);

//     if (!waiter) {
//       return res.status(404).json({ message: "Waiter not found" });
//     }

//     res.status(200).json({ message: "Waiter deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// // Get a specific waiter by ID
// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const waiter = await Waiter.findById(req.params.id);

//     if (!waiter) {
//       return res.status(404).json({ message: "Waiter not found" });
//     }

//     res.status(200).json(waiter);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// // Waiter Login
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const waiter = await Waiter.findOne({ username });
//     if (!waiter) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await waiter.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: waiter._id, permissions: waiter.permissions },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err });
//   }
// });

// module.exports = router;

// DELETE TAK CHAL RAHA SAB BADHIA

// waiterRoute.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Waiter = require("../models/Waiter");
const authMiddleware = require("../middleware/authMiddleware");
const { encrypt, decrypt } = require("../utils/encryption"); // Import encryption functions
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// 1. Get all waiters (requires `dashboard` permission)
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("waiters"),
  async (req, res) => {
    try {
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const waiters = await Waiter.find({ restaurantId });
      const modifiedWaiters = waiters.map((waiter) => {
        let plainPassword = "Not Available";

        try {
          plainPassword = decrypt(waiter.password);
        } catch (error) {}

        return {
          ...waiter.toObject(),
          plainPassword,
        };
      });

      res.status(200).json(modifiedWaiters);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// 2. Add a new waiter (requires `restaurantConfig` permission)
router.post(
  "/add",
  authMiddleware,
  permissionMiddleware("waiters"),
  async (req, res) => {
    try {
      const { username, password, permissions, restaurantId } = req.body;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const existingWaiter = await Waiter.findOne({ username, restaurantId });
      if (existingWaiter) {
        return res.status(400).json({ message: "Waiter already exists for this restaurant" });
      }
      const encryptedPassword = encrypt(password);
      const waiter = new Waiter({
        username,
        password: encryptedPassword,
        permissions,
        restaurantId,
      });
      await waiter.save();
      res.status(201).json({ message: "Waiter added successfully", waiter });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// 3. Update waiter permissions (requires `restaurantConfig` permission)
router.put(
  "/update/:id",
  authMiddleware,
  permissionMiddleware("waiters"),
  async (req, res) => {
    try {
      const { username, password, permissions, restaurantId } = req.body;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const updateData = { permissions };
      if (username) {
        updateData.username = username;
      }
      if (password) {
        const encryptedPassword = encrypt(password);
        updateData.password = encryptedPassword;
      }
      const waiter = await Waiter.findOneAndUpdate(
        { _id: req.params.id, restaurantId },
        updateData,
        { new: true }
      );
      if (!waiter) {
        return res.status(404).json({ message: "Waiter not found for this restaurant" });
      }
      res.status(200).json({ message: "Waiter updated successfully", waiter });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// 4. Delete a waiter (requires `restaurantConfig` permission)
router.delete(
  "/delete/:id",
  authMiddleware,
  permissionMiddleware("waiters"),
  async (req, res) => {
    try {
      const { restaurantId } = req.body;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const waiter = await Waiter.findOneAndDelete({ _id: req.params.id, restaurantId });
      if (!waiter) {
        return res.status(404).json({ message: "Waiter not found for this restaurant" });
      }
      res.status(200).json({ message: "Waiter deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// 5. Get a specific waiter by ID (requires `dashboard` permission)
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("waiters"),
  async (req, res) => {
    try {
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const waiter = await Waiter.findOne({ _id: req.params.id, restaurantId });
      if (!waiter) {
        return res.status(404).json({ message: "Waiter not found for this restaurant" });
      }
      let plainPassword = "Not Available";
      try {
        plainPassword = decrypt(waiter.password);
      } catch (error) {
        console.error("Error decrypting password:", error.message);
      }
      res.status(200).json({
        ...waiter.toObject(),
        plainPassword,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

//  protection

// 6. Waiter login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const waiter = await Waiter.findOne({ username });
    if (!waiter) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Decrypt and compare the password
    const decryptedPassword = decrypt(waiter.password);
    if (decryptedPassword !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token with permissions
    const token = jwt.sign(
      { id: waiter._id, permissions: waiter.permissions }, // Include permissions in the token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
