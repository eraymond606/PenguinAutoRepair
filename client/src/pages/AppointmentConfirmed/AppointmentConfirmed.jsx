import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AppointmentConfirmed.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

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
    <AuthLayout title="Your Appointment Has Been Confirmed!" showDots={false} transparent={true}>
      <div style={{ padding: '40px 20px', textAlign: 'center', background: 'transparent' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#064a63', marginBottom: '32px' }}>
          Your appointment has been confirmed!
        </h2>
        
        {appointment ? (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <strong>Service:</strong> <span>{appointment.service}</span>
            </div>

            <div className={styles.detailRow}>
              <strong>Date:</strong>{' '}
              <span>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "TBD"}</span>
            </div>

            <div className={styles.detailRow}>
              <strong>Time:</strong> <span>{appointment.time || "TBD"}</span>
            </div>

            {appointment.vehicle && (
              <div className={styles.detailRow}>
                <strong>Vehicle:</strong>
                <div className={styles.vehicleInfo}>
                  {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                  {appointment.vehicle.plate ? ` — Plate: ${appointment.vehicle.plate}` : ''}
                </div>
              </div>
            )}

            <div className={styles.detailRow}>
              <strong>Confirmation:</strong> <span>{appointment.confirmation}</span>
            </div>

            <p className={styles.emailNote}>An email confirmation has been sent to: example@example.com</p>
          </div>
        ) : (
          <p className={styles.emailNote}>An email confirmation has been sent.</p>
        )}

        <button className={styles.homeBtn} onClick={() => navigate("/")}>Home</button>
      </div>
    </AuthLayout>
  );
}
