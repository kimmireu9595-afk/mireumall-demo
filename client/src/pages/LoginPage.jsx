import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5005",
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    async function verifyToken() {
      try {
        const response = await fetch(`${apiBase}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          navigate("/");
        }
      } catch (error) {
        // Ignore auto-redirect failures
      }
    }

    verifyToken();
  }, [apiBase, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${apiBase}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      console.log("서버 응답 데이터:", data);
      if (data.token) {
        alert("토큰 수신 성공!");
      } else {
        alert(`서버가 토큰을 주지 않았습니다: ${JSON.stringify(data)}`);
      }
      if (!response.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }
      localStorage.setItem("token", data.token);
      console.log("저장된 토큰:", localStorage.getItem("token"));
      await new Promise((resolve) => setTimeout(resolve, 0));
      window.dispatchEvent(new Event("storage"));
      setStatus("success");
      setUser(data.user);
      setMessage(
        `${data.user?.name || data.user?.email || "사용자"}님 환영합니다.`
      );
      navigate("/");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page signup-page">
      <div className="card login-card">
        <div className="login-header">
          <h1>Login</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            ID
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            PASSWORD
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="primary login-button">
            Login
          </button>
        </form>

        {message && <p className={`form-message ${status}`}>{message}</p>}

        <div className="login-actions">
          <button type="button" className="ghost login-back" onClick={() => navigate("/")}>
            메인으로
          </button>
          <button type="button" className="ghost login-back" onClick={() => navigate("/signup")}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
