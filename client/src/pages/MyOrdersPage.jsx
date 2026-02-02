import { useEffect, useMemo, useState } from "react";

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "processing", label: "처리중" },
  { key: "shipping", label: "배송중" },
  { key: "completed", label: "완료" },
];

function mapStatusToTab(status) {
  if (status === "shipped") return "shipping";
  if (status === "delivered") return "completed";
  return "processing";
}

function MyOrdersPage() {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchOrders() {
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

        const ordersRes = await fetch(`${apiBase}/api/orders`, {
          headers: { Authorization: `Bearer ${cleanedToken}` },
        });
        const ordersData = await ordersRes.json();
        if (!ordersRes.ok) {
          throw new Error(ordersData.error || "주문 목록을 불러오지 못했습니다.");
        }

        const myOrders = (ordersData || []).filter(
          (order) => String(order.user) === String(userData._id)
        );
        setOrders(myOrders);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchOrders();
  }, [apiBase]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return mapStatusToTab(order.order_status) === activeTab;
  });

  return (
    <div className="page admin-page orders-page">
      <div className="admin-header">
        <p className="admin-badge">Orders</p>
        <h1>내 주문 목록</h1>
        <p className="admin-subtitle">주문 상태를 확인하세요.</p>
      </div>

      <div className="order-categories">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && <p className={`form-message ${status}`}>{message}</p>}

      <div className="order-list">
        {filteredOrders.map((order) => {
          const firstItem = order.items?.[0];
          const imageUrl = firstItem?.product?.image_url;
          return (
            <div className="order-card" key={order._id}>
              <div className="order-card-image">
                {imageUrl ? (
                  <img src={imageUrl} alt={firstItem?.product?.name || "상품"} />
                ) : (
                  <div className="order-card-image placeholder" />
                )}
              </div>
              <div className="order-card-info">
                <p className="order-card-number">주문 번호: {order.order_number}</p>
                <p className="order-card-price">₩{order.total_price}</p>
              </div>
              <span className="order-card-status">
                {activeTab === "all"
                  ? STATUS_TABS.find(
                      (tab) => tab.key === mapStatusToTab(order.order_status)
                    )?.label || "처리중"
                  : STATUS_TABS.find((tab) => tab.key === activeTab)?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyOrdersPage;
