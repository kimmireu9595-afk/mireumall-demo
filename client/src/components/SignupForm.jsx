import { useState } from "react";

const emptyForm = {
  email: "",
  name: "",
  password: "",
  adress: "",
};

function SignupForm({ onBack, onSubmit, status }) {
  const [form, setForm] = useState({
    ...emptyForm,
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (onSubmit) {
      await onSubmit(form, setForm, emptyForm);
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <label>
        이름
        <input
          name="name"
          type="text"
          placeholder="이름을 입력하세요"
          value={form.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        이메일
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
        비밀번호
        <input
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={form.password}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        주소 (선택)
        <input
          name="adress"
          type="text"
          placeholder="주소를 입력하세요"
          value={form.adress}
          onChange={handleChange}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="ghost" onClick={onBack}>
          뒤로가기
        </button>
        <button type="submit" className="primary" disabled={status === "loading"}>
          {status === "loading" ? "처리 중..." : "가입하기"}
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
