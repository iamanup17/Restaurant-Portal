const express = require("express");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");

const router = express.Router();

// Super admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const superAdmin = await SuperAdmin.findOne({ username });
    if (!superAdmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: superAdmin._id, role: "superadmin" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

const Restaurant = require("../models/Restaurant");
const Admin = require("../models/Admin");

// Onboard a new restaurant (create restaurant and admin credentials)
router.post("/onboard-restaurant", async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone, logoUrl, adminUsername, adminPassword } = req.body;
    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }
    // Create restaurant
    const restaurant = new Restaurant({ name, address, contactEmail, contactPhone, logoUrl });
    await restaurant.save();
    // Create admin for restaurant with full permissions
    const defaultPermissions = {
      dashboard: true,
      orders: true,
      restaurantConfig: true,
      manageMenu: true,
      waiters: true,
      inventory: true
    };
    const admin = new Admin({
      username: adminUsername,
      password: adminPassword,
      restaurantId: restaurant._id,
      permissions: defaultPermissions
    });
    await admin.save();
    res.status(201).json({ message: "Restaurant onboarded successfully", restaurant, admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get all restaurants
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get restaurant by ID
router.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Update restaurant details
router.put("/restaurants/:id", async (req, res) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(updatedRestaurant);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Delete restaurant
router.delete("/restaurants/:id", async (req, res) => {
  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
