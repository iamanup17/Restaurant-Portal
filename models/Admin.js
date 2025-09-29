// models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  permissions: {
    dashboard: { type: Boolean, default: true },
    orders: { type: Boolean, default: true },
    restaurantConfig: { type: Boolean, default: true },
    manageMenu: { type: Boolean, default: true },
    waiters: { type: Boolean, default: true },
    inventory: { type: Boolean, default: true }
  }
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);

// Roles and Access
