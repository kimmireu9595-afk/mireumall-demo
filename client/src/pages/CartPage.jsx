import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  useEffect(() => {
    async function fetchCart() {
      const token = localStorage.getItem("token");
      if (!token) {
        setItems([]);
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const cleanedToken = token.replace(/"/g, "");
        const userRes = await fetch(`${apiBase}/api/users/me`, {
          headers: { Authorization: `Bearer ${cleanedToken}` },
        });
        const userData = await userRes.json();
        if (!userRes.ok) {
          throw new Error(userData.error || "유저 정보를 불러오지 못했습니다.");
        }
        setUserId(userData._id);

        const cartRes = await fetch(`${apiBase}/api/carts/${userData._id}`, {
          headers: { Authorization: `Bearer ${cleanedToken}` },
        });
        const cartData = await cartRes.json();
        if (!cartRes.ok) {
          throw new Error(cartData.error || "장바구니 조회에 실패했습니다.");
        }

        const cartItems = cartData.items || [];
        setItems(cartItems);
        const nextCount = Array.isArray(cartItems) ? cartItems.length : 0;
        localStorage.setItem("cartCount", String(nextCount));
        window.dispatchEvent(new Event("storage"));
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchCart();
  }, [apiBase]);

  async function updateQuantity(productId, nextQuantity) {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const cleanedToken = token.replace(/"/g, "");
      const response = await fetch(
        `${apiBase}/api/carts/${userId}/items/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanedToken}`,
          },
          body: JSON.stringify({ quantity: nextQuantity }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "수량 변경에 실패했습니다.");
      }
      setItems(data.items || []);
      localStorage.setItem("cartCount", String((data.items || []).length));
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete(productId) {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const cleanedToken = token.replace(/"/g, "");
      const response = await fetch(
        `${apiBase}/api/carts/${userId}/items/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${cleanedToken}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }
      setItems(data.items || []);
      localStorage.setItem("cartCount", String((data.items || []).length));
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <p className="admin-badge">Cart</p>
        <h1>장바구니</h1>
        <p className="admin-subtitle">담긴 상품을 확인하세요.</p>
      </div>

      {message && <p className={`form-message ${status}`}>{message}</p>}

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>장바구니가 비어 있습니다. 쇼핑을 계속하세요.</p>
          <button className="nav-button" onClick={() => navigate("/")}>
            메인으로
          </button>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.product?._id || item.product}>
                <div className="cart-image">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} />
                  ) : (
                    <div className="product-image placeholder" />
                  )}
                </div>
                <div className="cart-info">
                  <p className="cart-name">{item.product?.name}</p>
                  <p className="cart-price">₩{item.product?.price}</p>
                </div>
                <div className="cart-actions">
                  <div className="cart-qty">
                    <button
                      className="ghost"
                      onClick={() =>
                        updateQuantity(
                          item.product?._id,
                          Math.max(1, (item.quantity || 1) - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="ghost"
                      onClick={() =>
                        updateQuantity(
                          item.product?._id,
                          (item.quantity || 1) + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="panel-button danger"
                    onClick={() => handleDelete(item.product?._id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-payment-footer">
            <div className="payment-summary">
              <span>총 상품 수량: {totalQuantity}개</span>
              <span>총 결제 금액: ₩{totalPrice}</span>
            </div>
            <button
              className="checkout-btn-full"
              onClick={() => navigate("/order")}
            >
              결제하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
