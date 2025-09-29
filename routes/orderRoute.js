// aug 3

const express = require("express");
const mongoose = require("mongoose"); // Added for ObjectId validation
const Order = require("../models/Orders");
const RestaurantConfig = require("../models/ManageConfig");
const dayjs = require("dayjs");
const authMiddleware = require("../middleware/authMiddleware");
const Razorpay = require("razorpay");

const router = express.Router();

// Get all orders with filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    filter.restaurantId = restaurantId;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate && endDate) {
      const formattedStartDate = dayjs(startDate, "DD/MM/YYYY").toDate();
      const formattedEndDate = dayjs(endDate, "DD/MM/YYYY").toDate();
      filter.orderDate = {
        $gte: formattedStartDate,
        $lte: formattedEndDate,
      };
    }
    if (minPrice) filter.totalPrice = { $gte: Number(minPrice) };
    if (maxPrice)
      filter.totalPrice = { ...filter.totalPrice, $lte: Number(maxPrice) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
        { tableNumber: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
      ];
    }
    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ orderDate: -1 });
    const totalOrders = await Order.countDocuments(filter);
    res.status(200).json({
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page),
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get pending orders
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: "Pending" }).sort({
      orderDate: -1,
    });
    console.log("Fetched pending orders:", pendingOrders);
    res.status(200).json(pendingOrders);
  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get order by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create or update an order
router.post("/", async (req, res) => {
  try {
    const {
      orderId,
      name,
      mobileNumber,
      items,
      totalPrice,
      tableNumber,
      roomNumber,
      status,
      paymentStatus,
      restaurantId,
    } = req.body;

    const restaurantConfig = await RestaurantConfig.findOne();

    // Validate required fields based on configuration
    const missingFields = [];
    if (restaurantConfig?.isNameRequired && !name) missingFields.push("name");
    if (restaurantConfig?.isMobileNumberRequired && !mobileNumber)
      missingFields.push("mobileNumber");
    if (!items) missingFields.push("items");
    if (!totalPrice) missingFields.push("totalPrice");
    if (restaurantConfig?.isTableNumberRequired && !tableNumber)
      missingFields.push("tableNumber");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (
      restaurantConfig &&
      restaurantConfig.allowMultipleTableSelection &&
      !Array.isArray(tableNumber)
    ) {
      return res
        .status(400)
        .json({ message: "Multiple table selection is required" });
    }

    let savedOrder;

    if (orderId) {
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      existingOrder.items.push(...items);
      existingOrder.totalPrice += totalPrice;
      existingOrder.name = name || existingOrder.name;
      existingOrder.mobileNumber = mobileNumber || existingOrder.mobileNumber;
      existingOrder.tableNumber = tableNumber || existingOrder.tableNumber;
      existingOrder.roomNumber = roomNumber || existingOrder.roomNumber;
      existingOrder.isNew = false;
      existingOrder.isUpdated = true;

      if (status && status !== existingOrder.status) {
        existingOrder.status = status;
      } else {
        existingOrder.status = "Pending";
      }

      existingOrder.updatedItems.push(items);

      savedOrder = await existingOrder.save();

      const io = req.app.get("io");
      io.emit("orderUpdated", {
        ...savedOrder.toObject(),
        newItems: savedOrder.newItems,
        updatedItems: items,
        statusChanged: status !== existingOrder.status || !status,
      });
    } else {
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required" });
      }
      const newOrder = new Order({
        name,
        mobileNumber,
        items,
        newItems: items,
        updatedItems: [],
        totalPrice,
        tableNumber: tableNumber || [],
        roomNumber: roomNumber || null,
        status: status || "Pending",
        paymentStatus: paymentStatus || "Pending",
        isNew: true,
        isUpdated: false,
        restaurantId,
      });
      savedOrder = await newOrder.save();

      const io = req.app.get("io");
      io.emit("newOrder", {
        ...savedOrder.toObject(),
        newItems: savedOrder.items,
        updatedItems: [],
      });
    }

    res.status(201).json({
      orderId: savedOrder._id,
      message: "Order processed successfully",
    });
  } catch (err) {
    console.error("Error processing order:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Update order status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !["Pending", "Completed", "Cancelled", "InProgress", "Rejected"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit orderUpdated event
    const io = req.app.get("io");
    io.emit("orderUpdated", updatedOrder.toObject());

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Delete an order
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit orderUpdated event for deletion
    const io = req.app.get("io");
    io.emit("orderUpdated", { _id: id, status: "Deleted" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PAYMENTS
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res
        .status(400)
        .json({ message: "Amount and orderId are required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `order_${orderId}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res
      .status(500)
      .json({ message: "Failed to create Razorpay order", error: err.message });
  }
});

// Update payment status
router.post("/update-payment-status", async (req, res) => {
  try {
    const { orderId, paymentStatus, razorpayPaymentId } = req.body;

    if (!orderId || !paymentStatus) {
      return res
        .status(400)
        .json({ message: "orderId and paymentStatus are required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus, razorpayPaymentId },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit orderUpdated event
    const io = req.app.get("io");
    io.emit("orderUpdated", updatedOrder.toObject());

    res
      .status(200)
      .json({ message: "Payment status updated", order: updatedOrder });
  } catch (err) {
    console.error("Error updating payment status:", err);
    res
      .status(500)
      .json({ message: "Failed to update payment status", error: err.message });
  }
});

module.exports = router;

// order segregation

// const express = require("express");
// const mongoose = require("mongoose");
// const Order = require("../models/Orders");
// const RestaurantConfig = require("../models/ManageConfig");
// const dayjs = require("dayjs");
// const authMiddleware = require("../middleware/authMiddleware");
// const Razorpay = require("razorpay");

// const router = express.Router();

// // Get all orders with filters
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const {
//       status,
//       paymentStatus,
//       startDate,
//       endDate,
//       minPrice,
//       maxPrice,
//       search,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {};
//     if (status) filter.status = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     if (startDate && endDate) {
//       const formattedStartDate = dayjs(startDate, "DD/MM/YYYY").toDate();
//       const formattedEndDate = dayjs(endDate, "DD/MM/YYYY")
//         .endOf("day")
//         .toDate();
//       filter.orderDate = {
//         $gte: formattedStartDate,
//         $lte: formattedEndDate,
//       };
//     }

//     if (minPrice) filter.totalPrice = { $gte: Number(minPrice) };
//     if (maxPrice)
//       filter.totalPrice = { ...filter.totalPrice, $lte: Number(maxPrice) };

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { "items.name": { $regex: search, $options: "i" } },
//         { tableNumber: { $regex: search, $options: "i" } },
//         { roomNumber: { $regex: search, $options: "i" } },
//         { address: { $regex: search, $options: "i" } },
//       ];
//     }

//     const orders = await Order.find(filter)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ orderDate: -1 });

//     const totalOrders = await Order.countDocuments(filter);

//     res.status(200).json({
//       totalOrders,
//       totalPages: Math.ceil(totalOrders / limit),
//       currentPage: Number(page),
//       orders,
//     });
//   } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Get pending orders
// router.get("/pending", authMiddleware, async (req, res) => {
//   try {
//     const pendingOrders = await Order.find({ status: "Pending" }).sort({
//       orderDate: -1,
//     });
//     console.log("Fetched pending orders:", pendingOrders);
//     res.status(200).json(pendingOrders);
//   } catch (err) {
//     console.error("Error fetching pending orders:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Get order by id
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({ message: "Invalid order ID" });
//     }
//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     res.status(200).json(order);
//   } catch (err) {
//     console.error("Error fetching order by ID:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Create or update an order
// router.post("/", async (req, res) => {
//   try {
//     const {
//       orderId,
//       name,
//       mobileNumber,
//       address,
//       orderType,
//       items,
//       totalPrice,
//       tableNumber,
//       roomNumber,
//       status,
//       paymentStatus,
//     } = req.body;

//     if (!orderType || !["DineIn", "QuickOrder", "HomeDelivery"].includes(orderType)) {
//       return res.status(400).json({ message: "Invalid or missing orderType" });
//     }

//     const restaurantConfig = await RestaurantConfig.findOne();

//     // Validate required fields based on orderType and configuration
//     const missingFields = [];
//     if (!items) missingFields.push("items");
//     if (!totalPrice) missingFields.push("totalPrice");

//     if (orderType === "DineIn") {
//       if (restaurantConfig?.dineIn?.isNameRequired && !name) missingFields.push("name");
//       if (restaurantConfig?.dineIn?.isMobileNumberRequired && !mobileNumber) missingFields.push("mobileNumber");
//       if (restaurantConfig?.dineIn?.isTableNumberRequired && !tableNumber) missingFields.push("tableNumber");
//       if (
//         restaurantConfig?.dineIn?.allowMultipleTableSelection &&
//         !Array.isArray(tableNumber)
//       ) {
//         return res
//           .status(400)
//           .json({ message: "Multiple table selection is required for DineIn" });
//       }
//     } else if (orderType === "QuickOrder") {
//       if (restaurantConfig?.quickOrder?.isNameRequired && !name) missingFields.push("name");
//       if (restaurantConfig?.quickOrder?.isMobileNumberRequired && !mobileNumber) missingFields.push("mobileNumber");
//     } else if (orderType === "HomeDelivery") {
//       if (restaurantConfig?.homeDelivery?.isNameRequired && !name) missingFields.push("name");
//       if (restaurantConfig?.homeDelivery?.isMobileNumberRequired && !mobileNumber) missingFields.push("mobileNumber");
//       if (restaurantConfig?.homeDelivery?.isAddressRequired && !address) missingFields.push("address");
//     }

//     if (missingFields.length > 0) {
//       return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     let savedOrder;

//     if (orderId) {
//       const existingOrder = await Order.findById(orderId);
//       if (!existingOrder) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       existingOrder.items.push(...items);
//       existingOrder.totalPrice += totalPrice;
//       existingOrder.name = name || existingOrder.name;
//       existingOrder.mobileNumber = mobileNumber || existingOrder.mobileNumber;
//       existingOrder.address = address || existingOrder.address;
//       existingOrder.orderType = orderType || existingOrder.orderType;
//       existingOrder.tableNumber = tableNumber || existingOrder.tableNumber;
//       existingOrder.roomNumber = roomNumber || existingOrder.roomNumber;
//       existingOrder.isNew = false;
//       existingOrder.isUpdated = true;

//       if (status && status !== existingOrder.status) {
//         existingOrder.status = status;
//       } else {
//         existingOrder.status = "Pending";
//       }

//       existingOrder.updatedItems.push(items);

//       savedOrder = await existingOrder.save();

//       const io = req.app.get("io");
//       io.emit("orderUpdated", {
//         ...savedOrder.toObject(),
//         newItems: savedOrder.newItems,
//         updatedItems: items,
//         statusChanged: status !== existingOrder.status || !status,
//       });
//     } else {
//       const newOrder = new Order({
//         name,
//         mobileNumber,
//         address,
//         orderType,
//         items,
//         newItems: items,
//         updatedItems: [],
//         totalPrice,
//         tableNumber: tableNumber || [],
//         roomNumber: roomNumber || null,
//         status: status || "Pending",
//         paymentStatus: paymentStatus || "Pending",
//         isNew: true,
//         isUpdated: false,
//       });
//       savedOrder = await newOrder.save();

//       const io = req.app.get("io");
//       io.emit("newOrder", {
//         ...savedOrder.toObject(),
//         newItems: savedOrder.items,
//         updatedItems: [],
//       });
//     }

//     res
//       .status(201)
//       .json({ orderId: savedOrder._id, message: "Order processed successfully" });
//   } catch (err) {
//     console.error("Error processing order:", err);
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Update order status
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (
//       !["Pending", "Completed", "Cancelled", "InProgress", "Rejected"].includes(status)
//     ) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const io = req.app.get("io");
//     io.emit("orderUpdated", updatedOrder.toObject());

//     res.status(200).json(updatedOrder);
//   } catch (err) {
//     console.error("Error updating order:", err);
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Delete an order
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedOrder = await Order.findByIdAndDelete(id);

//     if (!deletedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const io = req.app.get("io");
//     io.emit("orderUpdated", { _id: id, status: "Deleted" });

//     res.status(200).json({ message: "Order deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting order:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // PAYMENTS
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Create Razorpay order
// router.post("/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount, orderId } = req.body;

//     if (!amount || !orderId) {
//       return res
//         .status(400)
//         .json({ message: "Amount and orderId are required" });
//     }

//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: `order_${orderId}`,
//       payment_capture: 1,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     res.status(200).json({
//       id: razorpayOrder.id,
//       currency: razorpayOrder.currency,
//       amount: razorpayOrder.amount,
//     });
//   } catch (err) {
//     console.error("Error creating Razorpay order:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to create Razorpay order", error: err.message });
//   }
// });

// // Update payment status
// router.post("/update-payment-status", async (req, res) => {
//   try {
//     const { orderId, paymentStatus, razorpayPaymentId } = req.body;

//     if (!orderId || !paymentStatus) {
//       return res
//         .status(400)
//         .json({ message: "orderId and paymentStatus are required" });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { paymentStatus, razorpayPaymentId },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const io = req.app.get("io");
//     io.emit("orderUpdated", updatedOrder.toObject());

//     res
//       .status(200)
//       .json({ message: "Payment status updated", order: updatedOrder });
//   } catch (err) {
//     console.error("Error updating payment status:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to update payment status", error: err.message });
//   }
// });

// module.exports = router;

// Inventory management

// const express = require("express");
// const mongoose = require("mongoose"); // Added for ObjectId validation
// const Order = require("../models/Orders");
// const RestaurantConfig = require("../models/ManageConfig");
// const dayjs = require("dayjs");
// const authMiddleware = require("../middleware/authMiddleware");
// const Razorpay = require("razorpay");

// const InventoryItem = require("../models/InventoryItem");
// const InventoryLog = require("../models/InventoryLog");
// const Recipe = require("../models/Recipe");

// const router = express.Router();

// // Get all orders with filters
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const {
//       status,
//       paymentStatus,
//       startDate,
//       endDate,
//       minPrice,
//       maxPrice,
//       search,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {};
//     if (status) filter.status = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     if (startDate && endDate) {
//       const formattedStartDate = dayjs(startDate, "DD/MM/YYYY").toDate();
//       const formattedEndDate = dayjs(endDate, "DD/MM/YYYY")
//         .endOf("day")
//         .toDate();
//       filter.orderDate = {
//         $gte: formattedStartDate,
//         $lte: formattedEndDate,
//       };
//     }

//     if (minPrice) filter.totalPrice = { $gte: Number(minPrice) };
//     if (maxPrice)
//       filter.totalPrice = { ...filter.totalPrice, $lte: Number(maxPrice) };

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { "items.name": { $regex: search, $options: "i" } },
//         { tableNumber: { $regex: search, $options: "i" } },
//         { roomNumber: { $regex: search, $options: "i" } },
//       ];
//     }

//     const orders = await Order.find(filter)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ orderDate: -1 });

//     const totalOrders = await Order.countDocuments(filter);

//     res.status(200).json({
//       totalOrders,
//       totalPages: Math.ceil(totalOrders / limit),
//       currentPage: Number(page),
//       orders,
//     });
//   } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Get pending orders
// router.get("/pending", authMiddleware, async (req, res) => {
//   try {
//     const pendingOrders = await Order.find({ status: "Pending" }).sort({
//       orderDate: -1,
//     });
//     console.log("Fetched pending orders:", pendingOrders);
//     res.status(200).json(pendingOrders);
//   } catch (err) {
//     console.error("Error fetching pending orders:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Get order by id
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({ message: "Invalid order ID" });
//     }
//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     res.status(200).json(order);
//   } catch (err) {
//     console.error("Error fetching order by ID:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Create or update an order
// router.post("/", async (req, res) => {
//   try {
//     const {
//       orderId,
//       name,
//       mobileNumber,
//       items,
//       totalPrice,
//       tableNumber,
//       roomNumber,
//       status,
//       paymentStatus,
//     } = req.body;

//     const restaurantConfig = await RestaurantConfig.findOne();

//     // Validate required fields based on configuration
//     const missingFields = [];
//     if (restaurantConfig?.isNameRequired && !name) missingFields.push("name");
//     if (restaurantConfig?.isMobileNumberRequired && !mobileNumber)
//       missingFields.push("mobileNumber");
//     if (!items) missingFields.push("items");
//     if (!totalPrice) missingFields.push("totalPrice");
//     if (restaurantConfig?.isTableNumberRequired && !tableNumber)
//       missingFields.push("tableNumber");

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         message: `Missing required fields: ${missingFields.join(", ")}`,
//       });
//     }

//     if (
//       restaurantConfig &&
//       restaurantConfig.allowMultipleTableSelection &&
//       !Array.isArray(tableNumber)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Multiple table selection is required" });
//     }

//     let savedOrder;

//     if (orderId) {
//       const existingOrder = await Order.findById(orderId);
//       if (!existingOrder) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       existingOrder.items.push(...items);
//       existingOrder.totalPrice += totalPrice;
//       existingOrder.name = name || existingOrder.name;
//       existingOrder.mobileNumber = mobileNumber || existingOrder.mobileNumber;
//       existingOrder.tableNumber = tableNumber || existingOrder.tableNumber;
//       existingOrder.roomNumber = roomNumber || existingOrder.roomNumber;
//       existingOrder.isNew = false;
//       existingOrder.isUpdated = true;

//       if (status && status !== existingOrder.status) {
//         existingOrder.status = status;
//       } else {
//         existingOrder.status = "Pending";
//       }

//       existingOrder.updatedItems.push(items);

//       savedOrder = await existingOrder.save();

//       const io = req.app.get("io");
//       io.emit("orderUpdated", {
//         ...savedOrder.toObject(),
//         newItems: savedOrder.newItems,
//         updatedItems: items,
//         statusChanged: status !== existingOrder.status || !status,
//       });
//     } else {
//       const newOrder = new Order({
//         name,
//         mobileNumber,
//         items,
//         newItems: items,
//         updatedItems: [],
//         totalPrice,
//         tableNumber: tableNumber || [],
//         roomNumber: roomNumber || null,
//         status: status || "Pending",
//         paymentStatus: paymentStatus || "Pending",
//         isNew: true,
//         isUpdated: false,
//       });
//       savedOrder = await newOrder.save();

//       const io = req.app.get("io");
//       io.emit("newOrder", {
//         ...savedOrder.toObject(),
//         newItems: savedOrder.items,
//         updatedItems: [],
//       });
//     }

//     res.status(201).json({
//       orderId: savedOrder._id,
//       message: "Order processed successfully",
//     });
//   } catch (err) {
//     console.error("Error processing order:", err);
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Update order status
// // router.put("/:id", authMiddleware, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status } = req.body;

// //     if (
// //       !["Pending", "Completed", "Cancelled", "InProgress", "Rejected"].includes(
// //         status
// //       )
// //     ) {
// //       return res.status(400).json({ message: "Invalid status" });
// //     }

// //     const updatedOrder = await Order.findByIdAndUpdate(
// //       id,
// //       { status },
// //       { new: true }
// //     );

// //     if (!updatedOrder) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     // Emit orderUpdated event
// //     const io = req.app.get("io");
// //     io.emit("orderUpdated", updatedOrder.toObject());

// //     res.status(200).json(updatedOrder);
// //   } catch (err) {
// //     console.error("Error updating order:", err);
// //     res.status(400).json({ message: "Invalid data", error: err.message });
// //   }
// // });

// // inventory

// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (
//       !["Pending", "Completed", "Cancelled", "InProgress", "Rejected"].includes(
//         status
//       )
//     ) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // ✅ INVENTORY DEDUCTION LOGIC
//     if (status === "InProgress" && !order.inventoryDeducted) {
//       for (const orderItem of order.items) {
//         const { menuItemId, quantity } = orderItem;

//         const recipe = await Recipe.findOne({ menuItemId });
//         if (!recipe) continue;

//         for (const ingredient of recipe.ingredients) {
//           const totalToDeduct = ingredient.quantity * quantity;

//           // Deduct from inventory
//           await InventoryItem.findByIdAndUpdate(ingredient.inventoryItemId, {
//             $inc: { currentStock: -totalToDeduct },
//           });

//           // Log it
//           await InventoryLog.create({
//             inventoryItemId: ingredient.inventoryItemId,
//             change: -totalToDeduct,
//             reason: `Order ${order._id}`,
//           });
//         }
//       }

//       order.inventoryDeducted = true;
//     }

//     order.status = status;
//     const updatedOrder = await order.save();

//     // Emit socket event
//     const io = req.app.get("io");
//     io.emit("orderUpdated", updatedOrder.toObject());

//     res.status(200).json(updatedOrder);
//   } catch (err) {
//     console.error("Error updating order:", err);
//     res.status(400).json({ message: "Invalid data", error: err.message });
//   }
// });

// // Delete an order
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedOrder = await Order.findByIdAndDelete(id);

//     if (!deletedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Emit orderUpdated event for deletion
//     const io = req.app.get("io");
//     io.emit("orderUpdated", { _id: id, status: "Deleted" });

//     res.status(200).json({ message: "Order deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting order:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // PAYMENTS
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Create Razorpay order
// router.post("/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount, orderId } = req.body;

//     if (!amount || !orderId) {
//       return res
//         .status(400)
//         .json({ message: "Amount and orderId are required" });
//     }

//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: `order_${orderId}`,
//       payment_capture: 1,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     res.status(200).json({
//       id: razorpayOrder.id,
//       currency: razorpayOrder.currency,
//       amount: razorpayOrder.amount,
//     });
//   } catch (err) {
//     console.error("Error creating Razorpay order:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to create Razorpay order", error: err.message });
//   }
// });

// // Update payment status
// router.post("/update-payment-status", async (req, res) => {
//   try {
//     const { orderId, paymentStatus, razorpayPaymentId } = req.body;

//     if (!orderId || !paymentStatus) {
//       return res
//         .status(400)
//         .json({ message: "orderId and paymentStatus are required" });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { paymentStatus, razorpayPaymentId },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Emit orderUpdated event
//     const io = req.app.get("io");
//     io.emit("orderUpdated", updatedOrder.toObject());

//     res
//       .status(200)
//       .json({ message: "Payment status updated", order: updatedOrder });
//   } catch (err) {
//     console.error("Error updating payment status:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to update payment status", error: err.message });
//   }
// });

// module.exports = router;
