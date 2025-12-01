import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";
import styles from "./StaffLogin.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.staffLogin({ email, password });
      sessionStorage.setItem("token", res.token);
      sessionStorage.setItem("user", JSON.stringify(res.user));
      navigate("/staff");
    } catch (err) {
      console.error("Staff login error", err);
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Staff Login">
      <div className={`auth-main ${styles.staffLoginWrapper}`}>
        <h1 className="auth-title">Staff Login</h1>

        <form className="auth-form" onSubmit={submit}>
          <div className={styles.staffLoginInputs}>
            <div>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="Email" 
                required 
              />
            </div>

            <div>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="Password" 
                required 
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
