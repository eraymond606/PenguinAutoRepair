import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VerifyCode.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

export default function VerifyCode() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState(["", "", "", ""]);

  const update = (i, v) => {
    const clone = [...codes];
    clone[i] = v;
    setCodes(clone);
  };

  const submit = (e) => {
    e.preventDefault();
    console.log("VERIFY CODE", codes.join(""));
    // For the mock flow, navigate within the SPA to the reset password page
    navigate("/reset-password");
  };

  return (
    <AuthLayout title="Verify Email">
      <form className={styles.authForm} onSubmit={submit}>
        <div className={styles.codeRow}>
          {codes.map((c, i) => (
            <input
              key={i}
              maxLength="1"
              className={styles.codeBox}
              value={c}
              onChange={(e) => update(i, e.target.value)}
            />
          ))}
        </div>

        <button type="submit" className={styles.authBtn}>
          Submit
        </button>
      </form>
    </AuthLayout>
  );
}
