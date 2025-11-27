import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VerifyCode.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function VerifyCode() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState(["", "", "", ""]);

  const update = (i, v) => {
    // Only allow single digit
    const value = v.slice(-1);
    const clone = [...codes];
    clone[i] = value;
    setCodes(clone);

    // Auto-focus next input if value entered and not last box
    if (value && i < 3) {
      const nextInput = document.querySelector(`input[name="code-${i + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const submit = (e) => {
    e.preventDefault();
    console.log("VERIFY CODE", codes.join(""));
    navigate("/reset-password");
  };

  return (
    <AuthLayout title="Forgot Password">
      <div className={`auth-main ${styles.verifyWrapper}`}>
        <h2 className="auth-title">Verify Email</h2>
        <p className={styles.subText}>
          A 4-digit verification code was sent to the email on file.<br />
          Please enter it here.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <div className={styles.codeInputs}>
            {codes.map((c, i) => (
              <input
                key={i}
                name={`code-${i}`}
                maxLength="1"
                className={styles.codeInput}
                value={c}
                onChange={(e) => update(i, e.target.value)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <button type="submit" className="auth-btn">
            Submit
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
