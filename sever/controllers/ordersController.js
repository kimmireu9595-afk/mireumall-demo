const mongoose = require("mongoose");
const Order = require("../models/Order");

function resolveIamportKeys() {
  const impKey = process.env.IAMPORT_API_KEY;
  const impSecret = process.env.IAMPORT_API_SECRET;
  return { impKey, impSecret };
}

async function getIamportToken() {
  const { impKey, impSecret } = resolveIamportKeys();

  if (!impKey || !impSecret) {
    throw new Error("포트원 API 키가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key: impKey,
      imp_secret: impSecret,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data?.response?.access_token) {
    throw new Error(data?.message || "포트원 토큰 발급에 실패했습니다.");
  }
  return data.response.access_token;
}

async function verifyIamportPayment(impUid, amount) {
  const accessToken = await getIamportToken();
  const response = await fetch(
    `https://api.iamport.kr/payments/${impUid}`,
    {
      headers: { Authorization: accessToken },
    }
  );
  const data = await response.json();
  if (!response.ok || !data?.response) {
    throw new Error(data?.message || "포트원 결제 조회에 실패했습니다.");
  }

  if (data.response.amount !== amount) {
    throw new Error("결제 금액이 일치하지 않습니다.");
  }
  return data.response;
}

function shouldSkipIamportVerification() {
  return process.env.IAMPORT_SKIP_VERIFY === "true";
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createOrder(req, res) {
  try {
    const {
      order_number,
      user,
      items,
      total_price,
      shipping,
      payment,
      order_status,
      imp_uid,
    } = req.body;

    if (!order_number || !user) {
      return res
        .status(400)
        .json({ error: "order_number와 user는 필수입니다." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "주문 상품이 없습니다." });
    }

    if (!shipping?.phone_number || !shipping?.address) {
      return res.status(400).json({ error: "배송 정보를 입력해주세요." });
    }

    if (!payment?.provider) {
      return res.status(400).json({ error: "결제 모듈 정보가 필요합니다." });
    }

    if (typeof total_price !== "number" || total_price < 0) {
      return res.status(400).json({ error: "총 금액이 올바르지 않습니다." });
    }

    const exists = await Order.findOne({ order_number });
    if (exists) {
      return res.status(409).json({ error: "이미 처리된 주문입니다." });
    }

    if (imp_uid) {
      const { impKey, impSecret } = resolveIamportKeys();
      if (!impKey || !impSecret) {
        if (!shouldSkipIamportVerification()) {
          return res
            .status(400)
            .json({ error: "포트원 API 키를 설정해주세요." });
        }
      } else {
        await verifyIamportPayment(imp_uid, total_price);
      }
    }

    const order = await Order.create({
      order_number,
      user,
      items,
      total_price,
      shipping,
      payment,
      order_status,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await Order.find().populate("items.product", "-__v");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getOrderById(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    const order = await Order.findById(id).populate("items.product", "-__v");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateOrderById(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("items.product", "-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteOrderById(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function startShipping(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { order_status: "shipped" },
      { new: true, runValidators: true }
    ).populate("items.product", "-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function cancelOrder(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { order_status: "cancelled" },
      { new: true, runValidators: true }
    ).populate("items.product", "-__v");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  startShipping,
  cancelOrder,
};
