const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// Checkout - place order
router.post("/checkout", protect, authorize("user"), async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("item.productId");

    if (!cart || cart.item.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.item.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * item.quantity;
    }, 0);

    const order = await Order.create({
      userId: req.user.id,
      items: cart.item.map((i) => ({
        productId: i.productId._id,
        quantity: i.quantity
      })),
      totalAmount
    });

    // Clear cart
    cart.item = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate("items.productId");

    return res.status(201).json({ message: "Order placed successfully", order: populatedOrder });
  } catch (err) {
    console.log("Checkout error:", err);
    return res.status(500).json({ message: "Checkout error" });
  }
});

// Get user's orders
router.get("/", protect, authorize("user"), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log("Get orders error:", err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
});

// Admin: Get all orders
router.get("/all", protect, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log("Admin get all orders error:", err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
});

// Admin: Update order status
router.put("/status/:orderId", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate("items.productId").populate("userId", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Status updated", order });
  } catch (err) {
    console.log("Update status error:", err);
    return res.status(500).json({ message: "Error updating status" });
  }
});

module.exports = router;