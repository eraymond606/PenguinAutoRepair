import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import AuthLayout from "../components/layout/AuthLayout";

export default function AppointmentConfirmed() {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("lastAppointment");
    if (raw) {
      try {
        setAppointment(JSON.parse(raw));
      } catch (e) {
        console.warn("Invalid appointment data", e);
      }
    }
  }, []);

  return (
    <AuthLayout title="Your Appointment Has Been Confirmed!">
      {appointment ? (
        <div style={{ textAlign: "left", maxWidth: 560 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Service:</strong> <span style={{ marginLeft: 8 }}>{appointment.service}</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Date:</strong>{' '}
            <span style={{ marginLeft: 8 }}>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "TBD"}</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Time:</strong> <span style={{ marginLeft: 8 }}>{appointment.time || "TBD"}</span>
          </div>

          {appointment.vehicle && (
            <div style={{ marginBottom: 12 }}>
              <strong>Vehicle:</strong>
              <div style={{ marginTop: 6 }}>
                {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                {appointment.vehicle.plate ? ` — Plate: ${appointment.vehicle.plate}` : ''}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <strong>Confirmation:</strong> <span style={{ marginLeft: 8 }}>{appointment.confirmation}</span>
          </div>

          <p>An email confirmation has been sent.</p>
        </div>
      ) : (
        <p>An email confirmation has been sent.</p>
      )}

      <button className="auth-btn" onClick={() => navigate("/")}>Home</button>
    </AuthLayout>
  );
}
// client/src/pages/AppointmentConfirmed.jsx