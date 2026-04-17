const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const Product = require("../models/Product")

router.post("/add", protect, authorize("admin"), async (req, res) => {
    try {
        const { name, price, image, description } = req.body

        const newProduct = await Product.create({
            name,
            price,
            image,
            description
        })

        return res.status(201).json({ message: "Product added successfully" })
    } catch (err) {
        console.log("error from add product", err)
        return res.status(500).json({ message: `error from add product ${err}` })
    }
})

router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
        return res.status(200).json({ products })
    } catch (err) {
        console.log("error from get product", err)
        return res.status(500).json({ message: `error from get product ${err}` })
    }
})

router.post("/bulk", protect, authorize("admin"), async (req, res) => {
    try {
        const products = req.body; // expecting array

        if (!Array.isArray(products)) {
            return res.status(400).json({ message: "Expected an array of products" });
        }

        const insertedProducts = await Product.insertMany(products);

        return res.status(201).json({
            message: "Products added successfully",
            count: insertedProducts.length
        });
    } catch (err) {
        console.log("error from bulk add", err);
        return res.status(500).json({ message: "Error in bulk product insert" });
    }
});

module.exports = router