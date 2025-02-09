const express = require("express");
const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

// Add to Cart (for both guests and logged-in users)
router.post("/add", addToCart);

// Fetch Cart Items (for both guests and logged-in users)
router.get("/get", fetchCartItems);

// Update Cart Item Quantity (for both guests and logged-in users)
router.put("/update", updateCartItemQty);

// Delete Cart Item (for both guests and logged-in users)
router.delete("/delete/:productId", deleteCartItem);

module.exports = router;
