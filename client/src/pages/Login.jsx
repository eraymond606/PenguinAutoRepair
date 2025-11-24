// src/pages/Login.jsx
import React from "react";
import "../styles/Auth.css";

export default function Login() {
  const hero = "/images/hero.jpg"; // hero image located in public/images

  return (
    <div className="auth-page" style={{ ["--auth-hero"]: `url(${hero})` }}>
      <main>
        <h1 className="auth-title">Sign In</h1>

        <form className="auth-form">
          <label>Email</label>
          <input type="email" placeholder="Email" />

          <label>Password</label>
          <input type="password" placeholder="Password" />

          <div className="forgot-link">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <div className="auth-actions">
            <button className="btn-primary">Log In</button>
            <button className="btn-text" onClick={() => (window.location.href = "/signup")}>
              Sign Up
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
// client/src/pages/Login.jsx