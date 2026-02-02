const express = require("express");
const {
  getCartByUser,
  createOrReplaceCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  deleteCart,
} = require("../controllers/cartController");

const router = express.Router();

// Get cart by user
router.get("/:userId", getCartByUser);

// Create or replace cart
router.put("/:userId", createOrReplaceCart);

// Add item to cart
router.post("/:userId/items", addCartItem);

// Update cart item
router.put("/:userId/items/:productId", updateCartItem);

// Remove cart item
router.delete("/:userId/items/:productId", removeCartItem);

// Delete cart
router.delete("/:userId", deleteCart);

module.exports = router;
