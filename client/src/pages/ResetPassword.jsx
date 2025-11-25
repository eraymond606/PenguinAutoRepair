import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import AuthLayout from "../components/layout/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("RESET PASSWORD", pass, confirm);
    // In the mock flow, pretend the reset succeeded and send the user to login
    navigate("/login");
  };

  return (
    <AuthLayout title="Reset Password">
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
    </AuthLayout>
  );
}
// client/src/pages/ResetPassword.jsx