import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderPage() {
  const navigate = useNavigate();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const orderNumber = useMemo(() => `ORD-${Date.now()}`, []);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [shipping, setShipping] = useState({
    phone_number: "",
    address: "",
    zip_code: "",
  });
  const [paymentProvider, setPaymentProvider] = useState("카카오페이");

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  useEffect(() => {
    if (window.IMP) {
      window.IMP.init("imp00563532");
    }

    async function fetchOrderData() {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("로그인이 필요합니다.");
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
        setUser(userData);

        const cartRes = await fetch(`${apiBase}/api/carts/${userData._id}`, {
          headers: { Authorization: `Bearer ${cleanedToken}` },
        });
        const cartData = await cartRes.json();
        if (!cartRes.ok) {
          throw new Error(cartData.error || "장바구니 조회에 실패했습니다.");
        }
        setItems(cartData.items || []);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchOrderData();
  }, [apiBase]);

  function handleShippingChange(event) {
    const { name, value } = event.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  }

  const handlePayment = () => {
    const startPayment = () => {
      const { IMP } = window;
      IMP.init("imp00563532");

      if (!shipping.phone_number || !shipping.address) {
        alert("배송 정보를 모두 입력해주세요.");
        return;
      }

      if (!items.length) {
        alert("결제할 상품이 없습니다.");
        return;
      }

      const paymentName =
        items.length > 1
          ? `${items[0].product?.name} 외 ${items.length - 1}건`
          : items[0].product?.name;

      const data = {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid: orderNumber,
        name: paymentName,
        amount: Math.max(100, totalPrice),
        buyer_email: user?.email,
        buyer_name: user?.name,
        buyer_tel: shipping.phone_number,
        buyer_addr: shipping.address,
        buyer_postcode: shipping.zip_code || "",
      };

      IMP.request_pay(data, async (response) => {
        if (response.success) {
          try {
            const token = localStorage.getItem("token")?.replace(/"/g, "");
            const res = await fetch(`${apiBase}/api/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                order_number: response.merchant_uid,
                user: user?._id,
                items: items.map((item) => ({
                  product: item.product?._id,
                  quantity: item.quantity,
                  price: item.product?.price || 0,
                })),
                total_price: totalPrice,
                shipping: {
                  phone_number: shipping.phone_number,
                  address: shipping.address,
                },
                payment: {
                  provider: paymentProvider,
                  status: "paid",
                },
                order_status: "paid",
                imp_uid: response.imp_uid,
              }),
            });
            const orderData = await res.json();

            if (res.ok) {
              alert("결제가 완료되었습니다!");
              localStorage.setItem("cartCount", "0");
              localStorage.setItem("lastOrder", JSON.stringify(orderData));
              window.dispatchEvent(new Event("storage"));
              navigate("/success", { state: { order: orderData } });
            } else {
              alert(orderData?.error || "주문 저장에 실패했습니다.");
            }
          } catch (error) {
            console.error("주문 저장 에러:", error);
          }
        } else {
          alert(`결제 실패: ${response.error_msg}`);
        }
      });
    };

    if (!window.IMP) {
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/v1/iamport.js";
      script.onload = () => startPayment();
      document.head.appendChild(script);
    } else {
      startPayment();
    }
  };

  return (
    <div className="page admin-page order-page">
      <div className="admin-header">
        <p className="admin-badge">Order</p>
        <h1>주문 페이지</h1>
        <p className="admin-subtitle">주문 정보를 입력해 주세요.</p>
      </div>

      {message && <p className={`form-message ${status}`}>{message}</p>}

      <div className="order-layout">
        <section className="order-section">
          <h2>주문 기본 정보</h2>
          <div className="order-field">
            <span>오더 넘버</span>
            <strong>{orderNumber}</strong>
          </div>
          <div className="order-field">
            <span>유저</span>
            <strong>{user?.name || user?.email || "사용자"}</strong>
          </div>
        </section>

        <section className="order-section">
          <h2>주문 상품 정보</h2>
          {items.map((item) => (
            <div className="order-item-row" key={item.product?._id || item.product}>
              <div className="order-item-info">
                {item.product?.image_url ? (
                  <img
                    className="order-item-image"
                    src={item.product.image_url}
                    alt={item.product.name}
                  />
                ) : (
                  <div className="order-item-image placeholder" />
                )}
                <div>
                  <p>아이템 : {item.product?.name}</p>
                  <p>갯수: {item.quantity}</p>
                </div>
              </div>
              <strong>가격: ₩{item.product?.price}</strong>
            </div>
          ))}
        </section>

        <section className="order-section">
          <h2>금액 정보</h2>
          <div className="order-field">
            <span>총 가격</span>
            <strong>₩{totalPrice}</strong>
          </div>
        </section>

        <section className="order-section">
          <h2>배송 정보</h2>
          <div className="order-field">
            <span>폰 넘버</span>
            <input
              name="phone_number"
              value={shipping.phone_number}
              onChange={handleShippingChange}
              placeholder="010-0000-0000"
            />
          </div>
          <div className="order-field">
            <span>주소</span>
            <input
              name="address"
              value={shipping.address}
              onChange={handleShippingChange}
              placeholder="배송지 주소"
            />
          </div>
          <div className="order-field">
            <span>우편번호</span>
            <input
              name="zip_code"
              value={shipping.zip_code}
              onChange={handleShippingChange}
              placeholder="우편번호"
            />
          </div>
        </section>

        <section className="order-section">
          <h2>결제 정보</h2>
          <div className="order-field">
            <span>결제 모듈</span>
            <select
              value={paymentProvider}
              onChange={(event) => setPaymentProvider(event.target.value)}
            >
              <option value="카카오페이">카카오페이</option>
              <option value="네이버페이">네이버페이</option>
              <option value="기타 카드">기타 카드</option>
            </select>
          </div>
        </section>
      </div>

      <div className="order-actions">
        <button className="nav-button" onClick={() => navigate("/cart")}>
          장바구니로
        </button>
        <button className="checkout-btn-full" onClick={handlePayment}>
          결제 진행
        </button>
      </div>
    </div>
  );
}

export default OrderPage;
