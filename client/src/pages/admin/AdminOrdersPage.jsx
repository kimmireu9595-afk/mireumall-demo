import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function AdminOrdersPage() {
  const navigate = useNavigate();
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
      setStatus("loading");
      setMessage("");

      try {
        const token = localStorage.getItem("token");
        const cleanedToken = token?.replace(/"/g, "");
        const response = await fetch(`${apiBase}/api/orders`, {
          headers: cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "주문 목록을 불러오지 못했습니다.");
        }
        setOrders(data || []);
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

  async function handleStatusUpdate(orderId, action) {
    try {
      const token = localStorage.getItem("token");
      const cleanedToken = token?.replace(/"/g, "");
      const endpoint =
        action === "ship"
          ? `${apiBase}/api/orders/${orderId}/ship`
          : `${apiBase}/api/orders/${orderId}/cancel`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {},
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "주문 상태 변경에 실패했습니다.");
      }
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data : order))
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page admin-page orders-page admin-orders-page">
      <div className="admin-header">
        <p className="admin-badge">Orders</p>
        <h1>주문 관리</h1>
        <p className="admin-subtitle">전체 주문을 관리하세요.</p>
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
            <div className="order-card admin-order-card" key={order._id}>
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
                {STATUS_TABS.find(
                  (tab) => tab.key === mapStatusToTab(order.order_status)
                )?.label || "처리중"}
              </span>
              <div className="order-card-actions">
                <button
                  className="panel-button ghost"
                  type="button"
                  onClick={() => handleStatusUpdate(order._id, "ship")}
                >
                  배송 시작
                </button>
                <button
                  className="panel-button danger"
                  type="button"
                  onClick={() => handleStatusUpdate(order._id, "cancel")}
                >
                  주문 취소
                </button>
                <button
                  className="panel-button"
                  type="button"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                >
                  상세 보기
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
