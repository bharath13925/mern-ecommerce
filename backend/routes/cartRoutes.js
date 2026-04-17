const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");

// Add to cart
router.post("/add", protect, authorize("user"), async (req, res) => {
    try {
        console.log("REQ.USER 👉", req.user);  
        console.log("REQ.BODY 👉", req.body);   

        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            console.log("Creating new cart...");
            cart = await Cart.create({
                userId,
                item: [{ productId, quantity }]
            });
        } else {
            console.log("Updating existing cart...");

            const itemIndex = cart.item.findIndex(
                (i) => i.productId.toString() === productId
            );

            if (itemIndex > -1) {
                cart.item[itemIndex].quantity += quantity;
            } else {
                cart.item.push({ productId, quantity });
            }

            await cart.save();
        }

        console.log("UPDATED CART 👉", cart); 

        return res.status(200).json({ message: "Added to cart", cart });

    } catch (err) {
        console.log("Cart add error:", err);
        return res.status(500).json({ message: "Error adding to cart" });
    }
});

// Get cart
router.get("/", protect, authorize("user"), async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate("item.productId"); 

        if (!cart) {
            return res.status(200).json({ cart: { item: [] } });
        }

        return res.status(200).json({ cart });

    } catch (err) {
        console.log("Cart get error:", err);
        return res.status(500).json({ message: "Error fetching cart" });
    }
});

// Remove item
router.delete("/remove/:productId", protect, authorize("user"), async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.item = cart.item.filter(
            (i) => i.productId.toString() !== req.params.productId
        );
        await cart.save();
        return res.status(200).json({ message: "Item removed", cart });
    } catch (err) {
        return res.status(500).json({ message: `Error removing item: ${err}` });
    }
});

// Update quantity
router.put("/update/:productId", protect, authorize("user"), async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1)
            return res.status(400).json({ message: "Quantity must be at least 1" });

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.item.find(
            (i) => i.productId.toString() === req.params.productId
        );
        if (!item) return res.status(404).json({ message: "Item not in cart" });

        item.quantity = quantity;
        await cart.save();
        return res.status(200).json({ message: "Quantity updated", cart });
    } catch (err) {
        return res.status(500).json({ message: `Error updating quantity: ${err}` });
    }
});

module.exports = router;