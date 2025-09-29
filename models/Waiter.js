// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const waiterSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   permissions: {
//     dashboard: { type: Boolean, default: false },
//     orders: { type: Boolean, default: false },
//     restaurantConfig: { type: Boolean, default: false },
//     manageMenu: { type: Boolean, default: false },
//   },
// });

// // Hash password before saving
// waiterSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Compare password for login
// waiterSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model("Waiter", waiterSchema);

/////////////////////////////////

const mongoose = require("mongoose");

const waiterSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store encrypted password
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  permissions: {
    dashboard: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    restaurantConfig: { type: Boolean, default: false },
    manageMenu: { type: Boolean, default: false },
    waiters: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Waiter", waiterSchema);
