import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5005",
    []
  );
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setStatus("loading");
      setMessage("");

      try {
        const response = await fetch(`${apiBase}/api/products/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "상품 정보를 불러오지 못했습니다.");
        }
        setProduct(data);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchProduct();
  }, [apiBase, id]);

  async function handleAddToCart() {
    setCartMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setCartMessage("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const cleanedToken = token.replace(/"/g, "");
      const userRes = await fetch(`${apiBase}/api/users/me`, {
        headers: { Authorization: `Bearer ${cleanedToken}` },
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.error || "유저 정보를 불러오지 못했습니다.");
      }

      const response = await fetch(
        `${apiBase}/api/carts/${userData._id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanedToken}`,
          },
          body: JSON.stringify({ product: product._id, quantity: 1 }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "장바구니 추가에 실패했습니다.");
      }

      const nextCount =
        Array.isArray(data?.items) ? data.items.length : undefined;
      const currentCount = Number(localStorage.getItem("cartCount") || 0);
      localStorage.setItem(
        "cartCount",
        String(Number.isFinite(nextCount) ? nextCount : currentCount + 1)
      );
      window.dispatchEvent(new Event("storage"));
      setCartMessage("장바구니에 추가되었습니다.");
    } catch (error) {
      setCartMessage(error.message);
    }
  }

  return (
    <div className="page product-detail-page">
      <div className="product-detail-card">
        <button className="nav-button" onClick={() => navigate("/")}>
          뒤로가기
        </button>

        {message && <p className={`form-message ${status}`}>{message}</p>}

        {product && (
          <div className="product-detail-content">
            <div className="product-detail-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="product-image placeholder" />
              )}
            </div>
            <div className="product-detail-info">
              <h1>{product.name}</h1>
              <p className="product-detail-price">₩{product.price}</p>
              <div className="product-detail-actions">
                <button className="primary">구매하기</button>
                <button className="ghost">Like</button>
                <button className="ghost" onClick={handleAddToCart}>
                  장바구니
                </button>
              </div>
              {cartMessage && <p className="form-message">{cartMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
