// const mongoose = require("mongoose");

// const itemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   type: { type: String, required: true },
//   price: { type: Number, required: true },
// });

// const orderSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   mobileNumber: { type: String, required: true },
//   items: [itemSchema], // Cumulative list of all items
//   tableNumber: { type: [String], default: [] },
//   roomNumber: { type: String, default: null },
//   totalPrice: { type: Number, required: true },
//   orderDate: { type: Date, default: Date.now },
//   status: {
//     type: String,
//     default: "Pending",
//     enum: ["Pending", "Completed", "Cancelled", "InProgress", "Rejected"],
//   },
//   paymentStatus: {
//     type: String,
//     default: "Pending",
//     enum: ["Pending", "Paid", "Failed"],
//   },
//   isNew: { type: Boolean, default: true },
//   isUpdated: { type: Boolean, default: false },
//   newItems: [itemSchema], // Initial items for new orders
//   updatedItems: [[itemSchema]], // Array of arrays for iterative updates
// });

// module.exports = mongoose.model("Order", orderSchema);

// 3 aug

const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  name: { type: String, required: false },
  mobileNumber: { type: String, required: false },
  items: [itemSchema], // Cumulative list of all items
  tableNumber: { type: [String], default: [] },
  roomNumber: { type: String, default: null },
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  // inventory management
  inventoryDeducted: { type: Boolean, default: false },

  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Completed", "Cancelled", "InProgress", "Rejected"],
  },
  paymentStatus: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Paid", "Failed"],
  },
  isNew: { type: Boolean, default: true },
  isUpdated: { type: Boolean, default: false },
  newItems: [itemSchema], // Initial items for new orders
  updatedItems: [[itemSchema]], // Array of arrays for iterative updates
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
});

module.exports = mongoose.model("Order", orderSchema);

// order segregation

// const mongoose = require("mongoose");

// const itemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   type: { type: String, required: true },
//   price: { type: Number, required: true },
// });

// const orderSchema = new mongoose.Schema({
//   name: { type: String, required: false },
//   mobileNumber: { type: String, required: false },
//   address: { type: String, required: false },
//   orderType: {
//     type: String,
//     required: true,
//     enum: ["DineIn", "QuickOrder", "HomeDelivery"],
//     default: "DineIn",
//   },
//   items: [itemSchema],
//   tableNumber: { type: [String], default: [] },
//   roomNumber: { type: String, default: null },
//   totalPrice: { type: Number, required: true },
//   orderDate: { type: Date, default: Date.now },
//   status: {
//     type: String,
//     default: "Pending",
//     enum: ["Pending", "Completed", "Cancelled", "InProgress", "Rejected"],
//   },
//   paymentStatus: {
//     type: String,
//     default: "Pending",
//     enum: ["Pending", "Paid", "Failed"],
//   },
//   isNew: { type: Boolean, default: true },
//   isUpdated: { type: Boolean, default: false },
//   newItems: [itemSchema],
//   updatedItems: [[itemSchema]],
// });

// module.exports = mongoose.model("Order", orderSchema);
