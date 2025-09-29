// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     age: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);

// Notification

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // For admin authentication
    fcmToken: { type: String }, // Store FCM token for the admin
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
