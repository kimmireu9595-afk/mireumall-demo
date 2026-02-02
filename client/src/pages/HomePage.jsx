import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import homepageLogo from "../assets/homepage_logo.png";

function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productStatus, setProductStatus] = useState("idle");
  const [productMessage, setProductMessage] = useState("");
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );

  useEffect(() => {
    async function fetchProducts() {
      setProductStatus("loading");
      setProductMessage("");

      try {
        const response = await fetch(`${apiBase}/api/products`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "상품 조회에 실패했습니다.");
        }
        setProducts(data);
        setProductStatus("success");
      } catch (error) {
        setProductStatus("error");
        setProductMessage(error.message);
      }
    }

    fetchProducts();
  }, [apiBase]);

  return (
    <div className="page home-page">
      <header className="home-hero">
        <div className="hero-title-row">
          <img
            className="hero-logo hero-logo-large"
            src={homepageLogo}
            alt="Mireu Mall 로고"
          />
        </div>
        <p className="hero-subtitle">언제나 어디서나</p>
      </header>

      {productMessage && (
        <p className={`form-message ${productStatus}`}>{productMessage}</p>
      )}

      <section className="merch-grid">
        {products.map((product) => (
          <button
            type="button"
            className="merch-card"
            key={product._id}
            onClick={() => navigate(`/products/${product._id}`)}
          >
            {product.image_url ? (
              <img
                className="merch-image"
                src={product.image_url}
                alt={product.name}
              />
            ) : (
              <div className="merch-image" />
            )}
            <div className="merch-info">
              <p>{product.name}</p>
              <p>₩{product.price}</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
