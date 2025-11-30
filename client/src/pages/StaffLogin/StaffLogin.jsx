import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
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
    
    // Simulate a brief loading state
    setTimeout(() => {
      setLoading(false);
      navigate("/staff");
    }, 500);
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
