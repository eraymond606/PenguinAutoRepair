import React, { useState } from "react";
import "../styles/Auth.css";

export default function VerifyCode() {
  const [codes, setCodes] = useState(["", "", "", ""]);

  const update = (i, v) => {
    const clone = [...codes];
    clone[i] = v;
    setCodes(clone);
  };

  const submit = (e) => {
    e.preventDefault();
    console.log("VERIFY CODE", codes.join(""));
    window.location.href = "/reset-password";
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Verify Email</h1>

      <form className="auth-form" onSubmit={submit}>
        <div className="code-row">
          {codes.map((c, i) => (
            <input
              key={i}
              maxLength="1"
              className="code-box"
              value={c}
              onChange={(e) => update(i, e.target.value)}
            />
          ))}
        </div>

        <button type="submit" className="auth-btn">
          Submit
        </button>
      </form>
    </div>
  );
}
// client/src/pages/VerifyCode.jsx