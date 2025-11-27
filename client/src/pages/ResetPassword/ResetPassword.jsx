import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const validatePassword = (password) => {
    // At least 8 characters
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    // At least one capital letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter";
    }
    // At least one symbol (* + = > ! _ #)
    if (!/[*+=>\!_#]/.test(password)) {
      return "Password must contain at least one symbol (*, +, =, >, !, _, or #)";
    }
    // At least one number (0-9)
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number (0-9)";
    }
    return null;
  };

  const submit = (e) => {
    e.preventDefault();

    // Validate password
    const passwordError = validatePassword(pass);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    // Check if passwords match
    if (pass !== confirm) {
      alert("Passwords do not match");
      return;
    }

    console.log("RESET PASSWORD", pass, confirm);
    alert("Password reset successful! Please log in with your new password.");
    navigate("/login");
  };

  return (
    <AuthLayout title="Reset Password">
      <div className={`auth-main ${styles.resetWrapper}`}>
        <h2 className="auth-title">Reset Password</h2>
        <p className={`auth-sub ${styles.subText}`}>
          Reset your password. Minimum 8 characters, at least one capital letter,
          at least one symbol (*, +, =, or &gt;), and at least one number (0–9).
        </p>

        <form className="auth-form" onSubmit={submit}>
          <div className={styles.passwordInputs}>
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Submit
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
