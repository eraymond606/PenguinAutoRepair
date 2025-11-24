import React, { useState } from "react";
import "../styles/Auth.css";

export default function Schedule() {
  const [service, setService] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("SCHEDULE SERVICE", service);
    window.location.href = "/appointment-confirmed";
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Schedule Appointment</h1>

      <form className="auth-form" onSubmit={submit}>
        <select value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">Service</option>
          <option>Alignment</option>
          <option>Oil Change</option>
          <option>Diagnostic</option>
          <option>Tire Replacement</option>
        </select>

        <button type="submit" className="auth-btn">
          Submit
        </button>
      </form>
    </div>
  );
}
// client/src/pages/Schedule.jsx