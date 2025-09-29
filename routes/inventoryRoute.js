// const express = require("express");
// const router = express.Router();

// const InventoryItem = require("../models/InventoryItem");
// const Recipe = require("../models/Recipe");
// const InventoryLog = require("../models/InventoryLog");

// // 📌 Get all inventory items
// router.get("/", async (req, res) => {
//   const items = await InventoryItem.find();
//   res.json(items);
// });

// // 📌 Add new inventory item
// router.post("/", async (req, res) => {
//   const { name, unit, currentStock, lowStockThreshold } = req.body;
//   const item = new InventoryItem({ name, unit, currentStock, lowStockThreshold });
//   await item.save();
//   res.status(201).json(item);
// });

// // 📌 Update inventory stock (manual stock correction)
// router.patch("/:id", async (req, res) => {
//   const { currentStock } = req.body;
//   const item = await InventoryItem.findById(req.params.id);
//   if (!item) return res.status(404).json({ message: "Not found" });

//   const change = currentStock - item.currentStock;

//   await InventoryLog.create({
//     inventoryItemId: item._id,
//     change,
//     reason: "Manual stock update",
//   });

//   item.currentStock = currentStock;
//   await item.save();

//   res.json(item);
// });

// // 📌 Define recipe for a menu item
// router.post("/recipe", async (req, res) => {
//   const { menuItemId, ingredients } = req.body;
//   const recipe = await Recipe.findOneAndUpdate(
//     { menuItemId },
//     { ingredients },
//     { upsert: true, new: true }
//   );
//   res.status(201).json(recipe);
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const InventoryItem = require("../models/InventoryItem");
const Recipe = require("../models/Recipe");
const InventoryLog = require("../models/InventoryLog");
const authMiddleware = require("../middleware/authMiddleware");

// 📌 Get all inventory items
router.get("/", async (req, res) => {
  const items = await InventoryItem.find();
  res.json(items);
});

// 📌 Add new inventory item
router.post("/", authMiddleware, async (req, res) => {
  const { name, unit, currentStock, lowStockThreshold } = req.body;
  const item = new InventoryItem({
    name,
    unit,
    currentStock,
    lowStockThreshold,
  });
  await item.save();
  res.status(201).json(item);
});

// 📌 Update inventory stock (manual stock correction)
router.put("/:id", async (req, res) => {
  const { name, unit, currentStock, lowStockThreshold } = req.body;
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  const change = currentStock - item.currentStock;

  await InventoryLog.create({
    inventoryItemId: item._id,
    change,
    reason: "Manual stock update",
  });

  item.name = name;
  item.unit = unit;
  item.currentStock = currentStock;
  item.lowStockThreshold = lowStockThreshold;

  await item.save();

  res.json(item);
});

// 📌 Define recipe for a menu item
router.post("/recipe", async (req, res) => {
  const { menuItemId, ingredients } = req.body;
  const recipe = await Recipe.findOneAndUpdate(
    { menuItemId },
    { ingredients },
    { upsert: true, new: true }
  );
  res.status(201).json(recipe);
});

module.exports = router;
