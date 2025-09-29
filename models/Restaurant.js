const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  logoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  // Add more fields as needed (branding, settings, etc.)
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
