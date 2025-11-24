import React, { useState } from "react";
import "../styles/Auth.css";

export default function ResetPassword() {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("RESET PASSWORD", pass, confirm);
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Reset Password</h1>

      <form className="auth-form" onSubmit={submit}>
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button type="submit" className="auth-btn">
          Submit
        </button>
      </form>
    </div>
  );
}
// client/src/pages/ResetPassword.jsx