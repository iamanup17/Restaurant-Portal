// routes/menuRoutes.js
const express = require("express");
const Menu = require("../models/Menus");
const authMiddleware = require("../middleware/authMiddleware");
const { Types } = require("mongoose");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

router.put(
  "/update-category-order",
  authMiddleware,
  permissionMiddleware("manageMenu"),
  async (req, res) => {
    try {
      console.log("Request received at /update-category-order"); // Debugging
      console.log("Request body:", req.body); // Debugging

      const { orderedCategories } = req.body;

      if (!Array.isArray(orderedCategories)) {
        return res.status(400).json({
          error: "Invalid payload: orderedCategories must be an array",
        });
      }

      // Update the order for each category
      for (const category of orderedCategories) {
        await Menu.findByIdAndUpdate(
          new Types.ObjectId(category._id), // Convert _id to ObjectId
          { order: category.order }
        );
      }

      res.status(200).json({ message: "Category order updated successfully" });
    } catch (error) {
      console.error("Error updating category order:", error);
      res.status(500).json({ error: "Failed to update category order" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    const menu = await Menu.find({ restaurantId }).sort({ order: 1 });
    res.status(200).json(menu);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Add a new category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category } = req.body;

    // Check if a category with the same name already exists
    const existingCategory = await Menu.findOne({ category });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const newCategory = new Menu(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err });
  }
});

// Update a category
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("manageMenu"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { category } = req.body;

      // Check if another category with the same name already exists (excluding the current category)
      const existingCategory = await Menu.findOne({
        category,
        _id: { $ne: id }, // Exclude the current category
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists" });
      }

      const updatedCategory = await Menu.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedCategory)
        return res.status(404).json({ message: "Category not found" });
      res.status(200).json(updatedCategory);
    } catch (err) {
      res.status(400).json({ message: "Invalid data", error: err });
    }
  }
);

// Delete a category
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("manageMenu"),
  async (req, res) => {
    try {
      const deletedCategory = await Menu.findByIdAndDelete(req.params.id);
      if (!deletedCategory)
        return res.status(404).json({ message: "Category not found" });
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Add items to a specific category
// router.post(
//   "/:categoryId/items",
//   authMiddleware,
//   permissionMiddleware("manageMenu"),
//   async (req, res) => {
//     try {
//       const { categoryId } = req.params;
//       const { items } = req.body; // Expecting `items` to be an array

//       if (!Array.isArray(items)) {
//         return res.status(400).json({ message: "Items should be an array" });
//       }

//       // Fetch the category
//       const category = await Menu.findById(categoryId);
//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       // Validate each item
//       const validatedItems = items.map((item) => {
//         if (!item.fullPrice) {
//           throw new Error("Full price is required for all items");
//         }

//         // Check if an item with the same name already exists in the category
//         const existingItem = category.items.find(
//           (existing) => existing.name === item.name
//         );
//         if (existingItem) {
//           throw new Error(`Item with name '${item.name}' already exists`);
//         }

//         return {
//           name: item.name,
//           type: item.type || "veg", // Default to "veg" if not provided
//           showVegNonVeg:
//             item.showVegNonVeg !== undefined ? item.showVegNonVeg : true, // Default to true
//           halfPrice: item.halfPrice || null, // Optional
//           fullPrice: item.fullPrice,
//           additionalInfo: item.additionalInfo || "", // Optional
//           isAvailable: item.isAvailable !== undefined ? item.isAvailable : true, // Default to true
//         };
//       });

//       const updatedCategory = await Menu.findByIdAndUpdate(
//         categoryId,
//         { $push: { items: { $each: validatedItems } } }, // Add validated items
//         { new: true }
//       );

//       res.status(200).json(updatedCategory);
//     } catch (err) {
//       res
//         .status(400)
//         .json({ message: err.message || "Invalid data", error: err });
//     }
//   }
// );

// Add items with discount
router.post(
  "/:categoryId/items",
  authMiddleware,
  permissionMiddleware("manageMenu"),
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items should be an array" });
      }

      const category = await Menu.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const validatedItems = items.map((item) => {
        if (!item.fullPrice) {
          throw new Error("Full price is required for all items");
        }

        const existingItem = category.items.find(
          (existing) => existing.name === item.name
        );
        if (existingItem) {
          throw new Error(`Item with name '${item.name}' already exists`);
        }

        return {
          name: item.name,
          type: item.type || "veg",
          showVegNonVeg:
            item.showVegNonVeg !== undefined ? item.showVegNonVeg : true,
          halfPrice: item.halfPrice || null,
          fullPrice: item.fullPrice,
          halfDiscountPrice: item.halfDiscountPrice || null, // Add half discount price
          fullDiscountPrice: item.fullDiscountPrice || null, // Add full discount price
          additionalInfo: item.additionalInfo || "",
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        };
      });

      const updatedCategory = await Menu.findByIdAndUpdate(
        categoryId,
        { $push: { items: { $each: validatedItems } } },
        { new: true }
      );

      res.status(200).json(updatedCategory);
    } catch (err) {
      res
        .status(400)
        .json({ message: err.message || "Invalid data", error: err });
    }
  }
);

// Update a specific item in a category
// router.put(
//   "/:categoryId/items/:itemId",
//   authMiddleware,
//   permissionMiddleware("manageMenu"),
//   async (req, res) => {
//     try {
//       const { categoryId, itemId } = req.params;
//       const { name } = req.body;

//       // Fetch the category
//       const category = await Menu.findById(categoryId);
//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       // Check if another item with the same name already exists in the category (excluding the current item)
//       const existingItem = category.items.find(
//         (item) => item.name === name && item._id.toString() !== itemId
//       );
//       if (existingItem) {
//         return res
//           .status(400)
//           .json({ message: `Item with name '${name}' already exists` });
//       }

//       const updatedCategory = await Menu.findOneAndUpdate(
//         { _id: categoryId, "items._id": itemId },
//         { $set: { "items.$": req.body } },
//         { new: true }
//       );
//       if (!updatedCategory)
//         return res.status(404).json({ message: "Item or category not found" });
//       res.status(200).json(updatedCategory);
//     } catch (err) {
//       res.status(400).json({ message: "Invalid data", error: err });
//     }
//   }
// );

// Update item with discount
router.put(
  "/:categoryId/items/:itemId",
  authMiddleware,
  permissionMiddleware("manageMenu"),
  async (req, res) => {
    try {
      const { categoryId, itemId } = req.params;
      const {
        name,
        halfPrice,
        fullPrice,
        halfDiscountPrice,
        fullDiscountPrice,
      } = req.body;

      const category = await Menu.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const existingItem = category.items.find(
        (item) => item.name === name && item._id.toString() !== itemId
      );
      if (existingItem) {
        return res
          .status(400)
          .json({ message: `Item with name '${name}' already exists` });
      }

      const updatedCategory = await Menu.findOneAndUpdate(
        { _id: categoryId, "items._id": itemId },
        {
          $set: {
            "items.$": {
              ...req.body,
              halfDiscountPrice: halfDiscountPrice || null, // Include half discount price
              fullDiscountPrice: fullDiscountPrice || null, // Include full discount price
            },
          },
        },
        { new: true }
      );
      if (!updatedCategory)
        return res.status(404).json({ message: "Item or category not found" });
      res.status(200).json(updatedCategory);
    } catch (err) {
      res.status(400).json({ message: "Invalid data", error: err });
    }
  }
);

// Delete a specific item from a category
router.delete(
  "/:categoryId/items/:itemId",
  authMiddleware,
  async (req, res) => {
    try {
      const { categoryId, itemId } = req.params;
      const updatedCategory = await Menu.findByIdAndUpdate(
        categoryId,
        { $pull: { items: { _id: itemId } } },
        { new: true }
      );
      if (!updatedCategory)
        return res.status(404).json({ message: "Item or category not found" });
      res
        .status(200)
        .json({ message: "Item deleted successfully", updatedCategory });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Update item order within a category (drag-and-drop)
router.put(
  "/:categoryId/update-item-order",
  authMiddleware,
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { orderedItems } = req.body; // Expecting an array of item IDs in the new order

      if (!Array.isArray(orderedItems)) {
        return res
          .status(400)
          .json({ message: "Invalid data: orderedItems must be an array" });
      }

      // Fetch the category
      const category = await Menu.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Update the order field for each item
      const updatedItems = category.items.map((item) => {
        const newOrder = orderedItems.indexOf(item._id.toString()) + 1; // Get new order from the array index
        return { ...item.toObject(), order: newOrder }; // Update the order field
      });

      // Save the updated category
      category.items = updatedItems;
      await category.save();

      res.status(200).json({
        message: "Item order updated successfully",
        updatedCategory: category,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

router.get("/:categoryId/items", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Menu.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Sort items by order
    const sortedItems = category.items.sort((a, b) => a.order - b.order);
    res.status(200).json(sortedItems);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
