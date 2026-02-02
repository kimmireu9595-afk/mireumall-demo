const mongoose = require("mongoose");
const Cart = require("../models/Cart");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getCartByUser(req, res) {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "-__v"
    );
    if (!cart) {
      return res.status(200).json({ user: userId, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createOrReplaceCart(req, res) {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { user: userId, items: req.body.items || [] },
      { new: true, upsert: true, runValidators: true }
    ).populate("items.product", "-__v");

    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addCartItem(req, res) {
  const { userId } = req.params;
  const { product, quantity = 1 } = req.body;

  if (!isValidObjectId(userId) || !isValidObjectId(product)) {
    return res.status(400).json({ error: "Invalid user or product id" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const newCart = await Cart.create({
        user: userId,
        items: [{ product, quantity }],
      });
      const populated = await newCart.populate("items.product", "-__v");
      return res.status(201).json(populated);
    }

    const existing = cart.items.find(
      (item) => item.product.toString() === product
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();
    const populated = await cart.populate("items.product", "-__v");
    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateCartItem(req, res) {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
    return res.status(400).json({ error: "Invalid user or product id" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const item = cart.items.find(
      (entry) => entry.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate("items.product", "-__v");
    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function removeCartItem(req, res) {
  const { userId, productId } = req.params;
  if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
    return res.status(400).json({ error: "Invalid user or product id" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (entry) => entry.product.toString() !== productId
    );
    await cart.save();
    const populated = await cart.populate("items.product", "-__v");
    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteCart(req, res) {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const cart = await Cart.findOneAndDelete({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCartByUser,
  createOrReplaceCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  deleteCart,
};
