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
    // In a real app we'd send the email to the server. For the mock flow,
    // navigate to the verify code screen inside the SPA.
    navigate("/verify-code");
  };

  return (
    <AuthLayout title="Forgot Password">
      <form className={styles.authForm} onSubmit={submit}>
        <input
          type="email"
          placeholder="Please enter the email on file"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className={styles.authBtn}>
          Submit
        </button>
      </form>
    </AuthLayout>
  );
}
