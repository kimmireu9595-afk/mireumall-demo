import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setStatus("loading");
      setMessage("");

      try {
        const token = localStorage.getItem("token");
        const cleanedToken = token?.replace(/"/g, "");
        const response = await fetch(`${apiBase}/api/orders/${id}`, {
          headers: cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "주문 정보를 불러오지 못했습니다.");
        }
        setOrder(data);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchOrder();
  }, [apiBase, id]);

  if (!order && status !== "loading") {
    return (
      <div className="page admin-page order-detail-page">
        <div className="order-success-card">
          <h1>주문 정보를 찾을 수 없습니다.</h1>
          <p>{message || "주문 목록으로 돌아가 주세요."}</p>
          <button className="nav-button" onClick={() => navigate("/admin/orders")}>
            주문 목록
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page order-detail-page">
      <div className="admin-header">
        <p className="admin-badge">Order</p>
        <h1>주문 상세</h1>
        <p className="admin-subtitle">주문 상세 정보를 확인하세요.</p>
      </div>

      {message && <p className={`form-message ${status}`}>{message}</p>}

      {order && (
        <div className="order-success-card">
          <div className="order-success-info">
            <div>
              <span>주문 번호</span>
              <strong>{order.order_number}</strong>
            </div>
            <div>
              <span>주문 날짜</span>
              <strong>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("ko-KR")
                  : "-"}
              </strong>
            </div>
          </div>

          <div className="order-success-section">
            <h2>주문 상품</h2>
            {(order.items || []).map((item) => (
              <div
                className="order-success-item"
                key={item.product?._id || item.product}
              >
                <span>{item.product?.name || "상품"}</span>
                <span>수량 {item.quantity}</span>
                <strong>₩{item.price}</strong>
              </div>
            ))}
          </div>

          <div className="order-success-total">
            <span>총 가격</span>
            <strong>₩{order.total_price}</strong>
          </div>

          <button className="nav-button" onClick={() => navigate("/admin/orders")}>
            주문 목록
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetailPage;
