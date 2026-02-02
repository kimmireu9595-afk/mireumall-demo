const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("../controllers/productsController");

const router = express.Router();

// Create product
router.post("/", createProduct);

// Read all products
router.get("/", getProducts);

// Read product by id
router.get("/:id", getProductById);

// Update product by id
router.put("/:id", updateProductById);

// Delete product by id
router.delete("/:id", deleteProductById);

module.exports = router;
