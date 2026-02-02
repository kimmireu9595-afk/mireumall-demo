const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  loginUser,
  getUserFromToken,
} = require("../controllers/usersController");

const router = express.Router();

// Create user
router.post("/", createUser);

// Read all users
router.get("/", getUsers);

// Login user
router.post("/login", loginUser);

// Get user info from token
router.get("/me", requireAuth, getUserFromToken);

// Read user by id
router.get("/:id", getUserById);

// Update user by id
router.put("/:id", updateUserById);

// Delete user by id
router.delete("/:id", deleteUserById);

module.exports = router;
