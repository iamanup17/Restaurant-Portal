const mongoose = require("mongoose");

const restaurantConfigSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  showTableNumber: { type: Boolean, default: false },
  showRoomNumber: { type: Boolean, default: false },
  isTableNumberRequired: { type: Boolean, default: false },
  isRoomNumberRequired: { type: Boolean, default: false },
  isNameRequired: { type: Boolean, default: false },
  isMobileNumberRequired: { type: Boolean, default: false },
  tableNumbers: { type: [String], default: [] },
  roomNumbers: { type: [String], default: [] },
  phoneNumber: { type: String, default: "" },
  allowMultipleTableSelection: { type: Boolean, default: false },
  logoUrl: { type: String, default: "" },
  upiId: { type: String, default: "" },
  beneficiaryName: { type: String, default: "" },
  paymentMobileNumber: { type: String, default: "" },
  placeOrder: { type: Boolean, default: true },
});

module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);
