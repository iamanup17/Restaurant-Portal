const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  change: { type: Number, required: true },
  reason: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);
