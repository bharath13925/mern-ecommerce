const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  category: {
    type: String,
    enum: ["mobile", "laptop", "accessory", "other"],
    default: "other"
  },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);