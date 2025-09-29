// const mongoose = require("mongoose");

// const pendingActionSchema = new mongoose.Schema({
//   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
//   actionType: { type: String, enum: ["newOrder", "orderUpdated"], required: true },
//   timestamp: { type: Date, default: Date.now },
//   handled: { type: Boolean, default: false },
// });

// module.exports = mongoose.model("PendingAction", pendingActionSchema);


// models/PendingAction.js

// const mongoose = require("mongoose");

// const pendingActionSchema = new mongoose.Schema({
//   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
//   actionType: { type: String, enum: ["newOrder", "orderUpdated"], required: true },
//   timestamp: { type: Date, default: Date.now },
//   handled: { type: Boolean, default: false },
// });

// module.exports = mongoose.model("PendingAction", pendingActionSchema);

// models/PendingAction.js

const mongoose = require("mongoose");

const pendingActionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  actionType: { type: String, enum: ["newOrder", "orderUpdated"], required: true },
  timestamp: { type: Date, default: Date.now },
  handled: { type: Boolean, default: false },
});

module.exports = mongoose.model("PendingAction", pendingActionSchema);