import React, { useState } from "react";
import "../styles/Auth.css";

export default function Signup() {
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    console.log("SIGNUP", form);
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Create Account</h1>

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
    </div>
  );
}
// client/src/pages/Signup.jsx