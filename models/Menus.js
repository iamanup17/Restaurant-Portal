// // models/Menus.js
// const mongoose = require("mongoose");

// const ItemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   type: { type: String, enum: ["veg", "non veg"], default: "veg" },
//   showVegNonVeg: { type: Boolean, default: true },
//   halfPrice: { type: Number },
//   fullPrice: { type: Number, required: true },
//   additionalInfo: { type: String },
//   isAvailable: { type: Boolean, default: true },
//   order: { type: Number, default: 0 },
// });

// const MenuSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   items: [ItemSchema],
//   order: { type: Number, default: 0 }, // Add order field for categories
// });

// module.exports = mongoose.model("Menu", MenuSchema);

// models/Menus.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["veg", "non veg"], default: "veg" },
  showVegNonVeg: { type: Boolean, default: true },
  halfPrice: { type: Number },
  fullPrice: { type: Number, required: true },
  halfDiscountPrice: { type: Number }, // New field for half quantity discount
  fullDiscountPrice: { type: Number }, // New field for full quantity discount
  additionalInfo: { type: String },
  isAvailable: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const MenuSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [ItemSchema],
  order: { type: Number, default: 0 },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
});

module.exports = mongoose.model("Menu", MenuSchema);
