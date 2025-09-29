const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "MenuItem" },
  ingredients: [
    {
      inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Recipe", recipeSchema);
