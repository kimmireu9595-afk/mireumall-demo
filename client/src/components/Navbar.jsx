import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ user, onLogout, cartCount }) {
  const navigate = useNavigate();
  const [storedCount, setStoredCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function syncCount() {
      const value = Number(localStorage.getItem("cartCount") || 0);
      setStoredCount(Number.isNaN(value) ? 0 : value);
    }

    syncCount();
    window.addEventListener("storage", syncCount);
    return () => window.removeEventListener("storage", syncCount);
  }, []);

  const displayCount = typeof cartCount === "number" ? cartCount : storedCount;

  return (
    <nav className="home-nav navbar">
      <div className="nav-actions">
        <button className="nav-button" onClick={() => navigate("/")}>
          Home
        </button>
        {user ? (
          <>
            <div className="nav-dropdown">
              <button
                className="nav-greeting-button"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {user.user_type === "admin"
                  ? "👑 관리자님 반갑습니다!"
                  : `${user.name || "사용자"}님 반갑습니다!`}
              </button>
              {menuOpen && (
                <div className="nav-menu">
                  <button
                    className="nav-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/orders");
                    }}
                  >
                    내 주문 목록
                  </button>
                  <button
                    className="nav-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            {user.user_type === "admin" && (
              <button className="admin-button" onClick={() => navigate("/admin")}>
                관리자 페이지
              </button>
            )}
          </>
        ) : (
          <button className="nav-button" onClick={() => navigate("/login")}>
            로그인
          </button>
        )}
        <button className="cart-button" onClick={() => navigate("/cart")}>
          장바구니
          <span className="cart-count">{displayCount}</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
