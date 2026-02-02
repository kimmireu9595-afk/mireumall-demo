import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order =
    location.state?.order ||
    JSON.parse(localStorage.getItem("lastOrder") || "null");

  if (!order) {
    return (
      <div className="page admin-page order-success-page">
        <div className="order-success-card">
          <h1>주문 내역을 찾을 수 없습니다.</h1>
          <p>주문 정보를 다시 확인해주세요.</p>
          <button className="nav-button" onClick={() => navigate("/")}>
            메인으로
          </button>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("ko-KR")
    : new Date().toLocaleString("ko-KR");

  return (
    <div className="page admin-page order-success-page">
      <div className="order-success-card">
        <h1>주문이 성공적으로 완료 되었습니다</h1>
        <div className="order-success-info">
          <div>
            <span>주문 번호</span>
            <strong>{order.order_number}</strong>
          </div>
          <div>
            <span>주문 날짜</span>
            <strong>{orderDate}</strong>
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

        <div className="order-success-actions">
          <button className="nav-button" onClick={() => navigate("/orders")}>
            주문 목록
          </button>
          <button className="checkout-btn-full" onClick={() => navigate("/")}>
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
