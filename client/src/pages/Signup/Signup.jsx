import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";
import * as api from "../../lib/api";
import AuthLayout from "../../components/layout/AuthLayout";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const handle = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const validatePassword = (password) => {
    // At least 8 characters
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    // At least one capital letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter";
    }
    // At least one symbol (! _ + * = #)
    if (!/[!_+*=#]/.test(password)) {
      return "Password must contain at least one symbol (! _ + * = #)";
    }
    // At least one number (1-9)
    if (!/[1-9]/.test(password)) {
      return "Password must contain at least one number (1-9)";
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      // Validate password
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        alert(passwordError);
        return;
      }

      // Check if passwords match
      if (form.password !== form.confirm) {
        alert("Passwords do not match");
        return;
      }

      await api.signup(form);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>

        <form className={styles.signupForm} onSubmit={submit}>
          <div className={styles.fieldsGrid}>
            <input
              name="first"
              placeholder="First Name"
              value={form.first}
              onChange={handle}
              className={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handle}
              className={styles.input}
            />
            <input
              name="last"
              placeholder="Last Name"
              value={form.last}
              onChange={handle}
              className={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handle}
              className={styles.input}
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handle}
              className={styles.input}
            />
            <input
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handle}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
