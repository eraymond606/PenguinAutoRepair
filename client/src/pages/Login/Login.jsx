import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";
import styles from "./Login.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      sessionStorage.setItem("token", res.token);
      sessionStorage.setItem("user", JSON.stringify(res.user));
      navigate("/vehicles");
    } catch (err) {
      console.error("Login error", err);
      alert("Login failed: check your credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In">
      <div className={`auth-main ${styles.loginWrapper}`}>
        <h1 className="auth-title">Sign In</h1>

        <form className="auth-form" onSubmit={submit}>
          <div className={styles.loginInputs}>
            <div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
            </div>

            <div className={styles.passwordField}>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
              <div className={styles.forgotLink}>
                <a href="/forgot-password">Forgot password?</a>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </button>

            <button className={styles.signupBtn} type="button" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
