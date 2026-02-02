import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductCreatePage() {
  const navigate = useNavigate();
  const widgetRef = useRef(null);
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "상의",
    image_url: "",
    sku: "",
  });
  const [uploadError, setUploadError] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const scriptId = "cloudinary-upload-widget";
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function openUploadWidget() {
    setUploadError("");
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setUploadError("Cloudinary 설정이 필요합니다.");
      return;
    }

    if (!window.cloudinary) {
      setUploadError("업로드 위젯을 로딩 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "camera", "url"],
          multiple: false,
          maxFiles: 1,
        },
        (error, result) => {
          if (error) {
            setUploadError("이미지 업로드에 실패했습니다.");
            return;
          }
          if (result?.event === "success") {
            setForm((prev) => ({
              ...prev,
              image_url: result.info.secure_url,
            }));
          }
        }
      );
    }

    widgetRef.current.open();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!form.name || !form.sku || !form.image_url) {
        throw new Error("상품명, SKU, 메인 이미지는 필수입니다.");
      }

      const parsedPrice = Number(form.price);
      if (Number.isNaN(parsedPrice)) {
        throw new Error("판매 가격을 숫자로 입력해주세요.");
      }

      const payload = {
        ...form,
        price: parsedPrice,
      };

      const response = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.error?.includes("E11000") && data.error.includes("sku")) {
          throw new Error("SKU가 이미 존재합니다. 다른 SKU를 입력하세요.");
        }
        throw new Error(data.error || "상품 등록에 실패했습니다.");
      }

      setStatus("success");
      setMessage("상품 등록이 완료되었습니다.");
      setForm({
        name: "",
        price: "",
        category: "상의",
        image_url: "",
        sku: "",
      });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page signup-page">
      <div className="card signup-card">
        <div className="signup-header">
          <h1>상품 등록</h1>
          <p>새 상품 정보를 입력하세요</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            상품명
            <input
              name="name"
              type="text"
              placeholder="상품명을 입력하세요"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            판매 가격
            <input
              name="price"
              type="number"
              min="0"
              placeholder="판매 가격"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            카테고리
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="악세사리">악세사리</option>
              <option value="기타">기타</option>
            </select>
          </label>

          <label>
            메인 이미지
            <div className="image-uploader">
              <button
                type="button"
                className="ghost"
                onClick={openUploadWidget}
              >
                이미지 업로드
              </button>
              <input
                name="image_url"
                type="text"
                placeholder="이미지 URL"
                value={form.image_url}
                onChange={handleChange}
                required
              />
            </div>
            {uploadError && <p className="form-message error">{uploadError}</p>}
            {form.image_url && (
              <img
                className="image-preview"
                src={form.image_url}
                alt="상품 미리보기"
              />
            )}
          </label>

          <label>
            SKU
            <input
              name="sku"
              type="text"
              placeholder="SKU"
              value={form.sku}
              onChange={handleChange}
              required
            />
          </label>

          {message && <p className={`form-message ${status}`}>{message}</p>}

          <div className="form-actions">
            <button type="button" className="ghost" onClick={() => navigate("/admin")}>
              뒤로가기
            </button>
            <button type="submit" className="primary" disabled={status === "loading"}>
              {status === "loading" ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductCreatePage;
