import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <p className="admin-badge">Video Lesson</p>
        <h1>관리자 대시보드</h1>
        <p className="admin-subtitle">쇼핑몰 관리 시스템에 오신 것을 환영합니다.</p>
      </div>

      <section className="admin-panels">
        <div className="admin-panel wide-quick-actions">
          <div className="panel-header">
            <h2>빠른 작업</h2>
          </div>
          <div className="button-group-horizontal">
            <button
              className="panel-button primary"
              onClick={() => navigate("/admin/products/new")}
            >
              + 새 상품 등록
            </button>
            <button
              className="panel-button ghost"
              onClick={() => navigate("/admin/orders")}
            >
              주문 관리
            </button>
            <button
              className="panel-button ghost"
              onClick={() => navigate("/admin/products")}
            >
              상품 관리
            </button>
            <button className="panel-button ghost">고객 문의</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
