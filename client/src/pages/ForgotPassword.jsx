import React, { useState } from "react";
import "../styles/Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("FORGOT PASSWORD", email);
    window.location.href = "/verify-code";
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Forgot Password</h1>

      <form className="auth-form" onSubmit={submit}>
        <input
          type="email"
          placeholder="Please enter the email on file"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className="auth-btn">
          Submit
        </button>
      </form>
    </div>
  );
}
// client/src/pages/ForgotPassword.jsx