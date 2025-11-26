// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import * as api from "../lib/api";

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
    <div className="auth-page">
      <section
        className="hero"
        style={{ backgroundImage: `url('/images/hero.jpg')` }}
      />

      <main className="auth-main">
        <h1 className="auth-title">Sign In</h1>

        <form className="auth-form" onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />

          <div className="forgot-link">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <div className="auth-actions">
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Log In"}</button>
            <button className="btn-text" type="button" onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        </form>
      </main>
    </div>
  );
}
// client/src/pages/Login.jsx