import React from "react";
import "../styles/Auth.css";

export default function AppointmentConfirmed() {
  return (
    <div className="auth-page">
      <h1 className="auth-title">Your Appointment Has Been Confirmed!</h1>
      <p>An email confirmation has been sent.</p>

      <a href="/" className="auth-btn">
        Home
      </a>
    </div>
  );
}
// client/src/pages/AppointmentConfirmed.jsx