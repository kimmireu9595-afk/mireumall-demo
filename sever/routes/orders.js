const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  startShipping,
  cancelOrder,
} = require("../controllers/ordersController");

const router = express.Router();

// Create order
router.post("/", createOrder);

// Read all orders
router.get("/", getOrders);

// Read order by id
router.get("/:id", getOrderById);

// Update order by id
router.put("/:id", updateOrderById);

// Start shipping
router.patch("/:id/ship", startShipping);

// Cancel order
router.patch("/:id/cancel", cancelOrder);

// Delete order by id
router.delete("/:id", deleteOrderById);

module.exports = router;
