const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Product = require("../models/Product");

// Add product
router.post("/add", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, price, image, description, category } = req.body;
    const newProduct = await Product.create({ name, price, image, description, category });
    return res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.log("error from add product", err);
    return res.status(500).json({ message: `error from add product ${err}` });
  }
});

// Get all products with search and filter
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    let query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };

    const products = await Product.find(query).sort(sortOption);
    return res.status(200).json({ products });
  } catch (err) {
    console.log("error from get product", err);
    return res.status(500).json({ message: `error from get product ${err}` });
  }
});

// Bulk add products
router.post("/bulk", protect, authorize("admin"), async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Expected an array of products" });
    }
    const insertedProducts = await Product.insertMany(products);
    return res.status(201).json({ message: "Products added successfully", count: insertedProducts.length });
  } catch (err) {
    console.log("error from bulk add", err);
    return res.status(500).json({ message: "Error in bulk product insert" });
  }
});

// Add review
router.post("/:productId/review", protect, authorize("user"), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user.id
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    product.reviews.push({
      userId: req.user.id,
      userName: req.body.userName || "User",
      rating,
      comment
    });

    // Recalculate average rating
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    return res.status(201).json({ message: "Review added", product });
  } catch (err) {
    console.log("Review error:", err);
    return res.status(500).json({ message: "Error adding review" });
  }
});

module.exports = router;