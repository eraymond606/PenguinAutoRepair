import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotPassword.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("FORGOT PASSWORD", email);
    navigate("/verify-code");
  };

  return (
    <AuthLayout title="Forgot Password">
      <div className={`auth-main ${styles.forgotWrapper}`}>
        <h2 className="auth-title">Verify Email</h2>
        <p className="auth-sub">Please enter the email on file</p>

        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Submit
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
