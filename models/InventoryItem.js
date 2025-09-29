const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true }, // e.g., "grams", "liters", "pieces"
  currentStock: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
