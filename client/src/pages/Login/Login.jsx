// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";
import styles from "./Login.module.css";

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
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{ backgroundImage: `url('/images/hero.jpg')` }}
      />

      <main className={styles.main}>
        <h1 className={styles.title}>Sign In</h1>

        <form className={styles.form} onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />

          <div className={styles.forgotLink}>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnPrimary} type="submit" disabled={loading}>{loading ? "Signing in..." : "Log In"}</button>
            <button className={styles.btnText} type="button" onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        </form>
      </main>
    </div>
  );
}
