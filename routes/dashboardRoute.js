// routes/dashboardRoutes.js
const express = require("express");
const Menu = require("../models/Menus");
const Order = require("../models/Orders");

const router = express.Router();

// Get total menu items
router.get("/total-menu-items", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const totalMenuItems = await Menu.aggregate([
      { $match: { restaurantId: restaurantId } },
      { $unwind: "$items" },
      { $count: "totalMenuItems" },
    ]);
    res.status(200).json(totalMenuItems[0] || { totalMenuItems: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get total orders
router.get("/total-orders", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const totalOrders = await Order.countDocuments({ restaurantId });
    res.status(200).json({ totalOrders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get revenue generated
router.get("/revenue-generated", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const revenueGenerated = await Order.aggregate([
      { $match: { restaurantId: restaurantId } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    res.status(200).json(revenueGenerated[0] || { totalRevenue: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get total customers
router.get("/total-customers", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const totalCustomers = await Order.distinct("mobileNumber", { restaurantId });
    res.status(200).json({ totalCustomers: totalCustomers.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get recent orders
router.get("/recent-orders", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const recentOrders = await Order.find({ restaurantId })
      .sort({ orderDate: -1 })
      .limit(10)
      .select("_id name mobileNumber items totalPrice status orderDate");
    res.status(200).json(recentOrders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get top selling items
router.get("/top-selling-items", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const topSellingItems = await Order.aggregate([
      { $match: { restaurantId: restaurantId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);
    res.status(200).json(topSellingItems);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get order status distribution
router.get("/order-status-distribution", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const orderStatusDistribution = await Order.aggregate([
      { $match: { restaurantId: restaurantId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(orderStatusDistribution);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get revenue trends
router.get("/revenue-trends", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const revenueTrends = await Order.aggregate([
      { $match: { restaurantId: restaurantId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(revenueTrends);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
