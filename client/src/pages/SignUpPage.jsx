import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/SignupForm";

function SignUpPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );

  async function handleSignup(form, setForm, emptyForm) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${apiBase}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      setStatus("success");
      setMessage("회원가입이 완료되었습니다.");
      setForm(emptyForm);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page signup-page">
      <div className="card signup-card">
        <div className="signup-header">
          <h1>회원가입</h1>
          <p>새로운 계정을 만들어 쇼핑을 시작하세요</p>
        </div>

        <SignupForm
          onBack={() => navigate("/")}
          onSubmit={handleSignup}
          status={status}
        />
        {message && (
          <p className={`form-message ${status}`}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
