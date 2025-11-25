import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import * as api from "../lib/api";
import AuthLayout from "../components/layout/AuthLayout";

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

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      // basic client-side validation
      if (!form.email || !form.password) {
        alert("Please provide email and password.");
        return;
      }

      await api.signup(form);
      // after signup, send user to login page
      navigate("/login");
    } catch (err) {
      console.error("Signup failed", err);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form className="auth-form" onSubmit={submit}>
        <input
          name="first"
          placeholder="First Name"
          value={form.first}
          onChange={handle}
        />
        <input
          name="last"
          placeholder="Last Name"
          value={form.last}
          onChange={handle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handle}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handle}
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handle}
        />

        <button type="submit" className="auth-btn">
          Submit
        </button>
      </form>
    </AuthLayout>
  );
}
// client/src/pages/Signup.jsx