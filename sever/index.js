const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const cartRouter = require("./routes/carts");
const orderRouter = require("./routes/orders");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const MONGODB_URI =
  process.env.MONGODB_ATLAS_URL ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/shoppingmall_demo";

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/orders", orderRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
