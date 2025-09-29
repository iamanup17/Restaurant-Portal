  // restaurantId: { type: String, required: true },
// // models/ManageConfig.js
// const mongoose = require("mongoose");

// const restaurantConfigSchema = new mongoose.Schema({
//   showTableNumber: { type: Boolean, default: false }, // Enable/disable table number option
//   showRoomNumber: { type: Boolean, default: false }, // Enable/disable room number option
//   isTableNumberRequired: { type: Boolean, default: false }, // Make table number required
//   isRoomNumberRequired: { type: Boolean, default: false }, // Make room number required
//   tableNumbers: { type: [String], default: [] }, // Dynamic list of table numbers
//   roomNumbers: { type: [String], default: [] }, // Dynamic list of room numbers
//   phoneNumber: { type: String, default: "" }, // Restaurant phone number
// });

// module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);

// // models/ManageConfig.js
// const mongoose = require("mongoose");

// const restaurantConfigSchema = new mongoose.Schema({
//   showTableNumber: { type: Boolean, default: false },
//   showRoomNumber: { type: Boolean, default: false },
//   isTableNumberRequired: { type: Boolean, default: false },
//   isRoomNumberRequired: { type: Boolean, default: false },
//   tableNumbers: { type: [String], default: [] },
//   roomNumbers: { type: [String], default: [] },
//   phoneNumber: { type: String, default: "" },
//   allowMultipleTableSelection: { type: Boolean, default: false }, // New field
//   logoUrl: { type: String, default: "" },
// });

// module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);

// models/ManageConfig.js
// const mongoose = require("mongoose");

// const restaurantConfigSchema = new mongoose.Schema({
//   showTableNumber: { type: Boolean, default: false },
//   showRoomNumber: { type: Boolean, default: false },
//   isTableNumberRequired: { type: Boolean, default: false },
//   isRoomNumberRequired: { type: Boolean, default: false },
//   tableNumbers: { type: [String], default: [] },
//   roomNumbers: { type: [String], default: [] },
//   phoneNumber: { type: String, default: "" },
//   allowMultipleTableSelection: { type: Boolean, default: false },
//   logoUrl: { type: String, default: "" },
//   upiId: { type: String, default: "" },
//   beneficiaryName: { type: String, default: "" },
//   paymentMobileNumber: { type: String, default: "" },
// });

// module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);

// 3 august
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
});

module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);

// order segregation

// const mongoose = require("mongoose");

// const restaurantConfigSchema = new mongoose.Schema({
//   dineIn: {
//     showTableNumber: { type: Boolean, default: false },
//     isTableNumberRequired: { type: Boolean, default: false },
//     showRoomNumber: { type: Boolean, default: false },
//     isRoomNumberRequired: { type: Boolean, default: false },
//     isNameRequired: { type: Boolean, default: false },
//     isMobileNumberRequired: { type: Boolean, default: false },
//     tableNumbers: { type: [String], default: [] },
//     roomNumbers: { type: [String], default: [] },
//     allowMultipleTableSelection: { type: Boolean, default: false },
//   },
//   quickOrder: {
//     isNameRequired: { type: Boolean, default: false },
//     isMobileNumberRequired: { type: Boolean, default: false },
//   },
//   homeDelivery: {
//     isNameRequired: { type: Boolean, default: false },
//     isMobileNumberRequired: { type: Boolean, default: false },
//     isAddressRequired: { type: Boolean, default: false },
//   },
//   phoneNumber: { type: String, default: "" },
//   logoUrl: { type: String, default: "" },
//   upiId: { type: String, default: "" },
//   beneficiaryName: { type: String, default: "" },
//   paymentMobileNumber: { type: String, default: "" },
// });

// module.exports = mongoose.model("RestaurantConfig", restaurantConfigSchema);
