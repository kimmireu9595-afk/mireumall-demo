import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductListPage() {
  const navigate = useNavigate();
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    price: "",
    category: "상의",
    image_url: "",
    sku: "",
  });

  useEffect(() => {
    async function fetchProducts() {
      setStatus("loading");
      setMessage("");

      try {
        const response = await fetch(`${apiBase}/api/products`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "상품 조회에 실패했습니다.");
        }
        setProducts(data);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    fetchProducts();
  }, [apiBase]);

  function startEdit(product) {
    setEditingId(product._id);
    setDraft({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "상의",
      image_url: product.image_url || "",
      sku: product.sku || "",
    });
    setMessage("");
  }

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(productId) {
    setStatus("loading");
    setMessage("");

    try {
      const payload = { ...draft, price: Number(draft.price) };
      const response = await fetch(`${apiBase}/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "상품 수정에 실패했습니다.");
      }
      setProducts((prev) =>
        prev.map((item) => (item._id === productId ? data : item))
      );
      setEditingId(null);
      setStatus("success");
      setMessage("상품이 수정되었습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${apiBase}/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "상품 삭제에 실패했습니다.");
      }
      setProducts((prev) => prev.filter((item) => item._id !== productId));
      setStatus("success");
      setMessage("상품이 삭제되었습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page admin-page admin-product-page">
      <div className="navbar-right">
        {message && <span className={`nav-message ${status}`}>{message}</span>}
        <button className="nav-button" onClick={() => navigate("/admin")}>
          관리자 대시보드
        </button>
      </div>

      <aside className="side-header">
        <p className="admin-badge">Products</p>
        <h1>상품 관리</h1>
        <button
          className="panel-button primary"
          onClick={() => navigate("/admin/products/new")}
        >
          + 새 상품 등록
        </button>
      </aside>

      <section className="product-list-container">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            {product.image_url ? (
              <img
                className="product-image"
                src={product.image_url}
                alt={product.name}
              />
            ) : (
              <div className="product-image placeholder" />
            )}
            {editingId === product._id ? (
              <div className="product-edit">
                <input
                  name="name"
                  value={draft.name}
                  onChange={handleDraftChange}
                  placeholder="상품명"
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={handleDraftChange}
                  placeholder="가격"
                />
                <select
                  name="category"
                  value={draft.category}
                  onChange={handleDraftChange}
                >
                  <option value="상의">상의</option>
                  <option value="하의">하의</option>
                  <option value="악세사리">악세사리</option>
                  <option value="기타">기타</option>
                </select>
                <input
                  name="image_url"
                  value={draft.image_url}
                  onChange={handleDraftChange}
                  placeholder="이미지 URL"
                />
                <input
                  name="sku"
                  value={draft.sku}
                  onChange={handleDraftChange}
                  placeholder="SKU"
                />
                <div className="product-actions">
                  <button
                    className="panel-button primary"
                    onClick={() => handleSave(product._id)}
                  >
                    저장
                  </button>
                  <button
                    className="panel-button ghost"
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-sku">SKU: {product.sku}</p>
                <p className="product-meta">
                  {product.category} · ₩{product.price}
                </p>
                <div className="product-actions">
                  <button
                    className="panel-button ghost"
                    onClick={() => startEdit(product)}
                  >
                    수정
                  </button>
                  <button
                    className="panel-button danger"
                    onClick={() => handleDelete(product._id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default ProductListPage;
