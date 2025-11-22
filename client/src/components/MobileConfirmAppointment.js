// client/src/components/MobileConfirmAppointment.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileConfirmAppointment.css';
import logo192 from '../assets/logo192.png';
import { createAppointment } from './Api';

function formatShortDate(dateISO) {
  const d = new Date(dateISO + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateISO;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  return `${m}/${day}/${yy}`;
}

function upperTime(label = '') {
  return label.replace('am', 'AM').replace('pm', 'PM');
}

export default function MobileConfirmAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, vehicle, service_id, service, dateISO, slot } =
    location.state || {};

  const serviceName = service?.name || 'Selected Service';
  const dateDisplay = dateISO ? formatShortDate(dateISO) : 'N/A';
  const timeDisplay = slot?.label ? upperTime(slot.label) : 'N/A';

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!customer || !vehicle || !service_id || !dateISO || !slot) {
      alert('Missing appointment details. Please go back and try again.');
      return;
    }

    try {
      const [hStr, mStr] = slot.id.split(':');
      const hour = hStr.padStart(2, '0');
      const minute = mStr.padStart(2, '0');
      const start_time = `${dateISO}T${hour}:${minute}:00`;

      const payload = {
        customer_id: customer.customer_id,
        vehicle_id: vehicle.vehicle_id,
        service_id: Number(service_id),
        start_time,
      };

      const { data } = await createAppointment(payload);

      if (!data?.ok) {
        alert(
          `Could not create appointment: ${data?.error || 'unknown-error'}`
        );
        return;
      }

      navigate('/mobile/appointment-confirmed', {
        state: { customer },
      });

    } catch (err) {
      console.error(err);
      alert('Something went wrong while creating the appointment.');
    }
  };

  return (
    <div className="mobile-frame confirm-screen">
      <button
        type="button"
        className="back-link"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="bubbles">
        <span className="bubble edge edge-right"></span>
        <span className="bubble edge edge-left"></span>
        <span className="bubble big-top-left"></span>
        <span className="bubble m b1"></span>
        <span className="bubble m b2"></span>
        <span className="bubble m b3"></span>
        <span className="bubble s s1"></span>
        <span className="bubble s s2"></span>
        <span className="bubble s s3"></span>
        <span className="bubble s s4"></span>
      </div>

      <img src={logo192} alt="Penguin Mechanic" className="confirm-logo" />

      <h3 className="confirm-title">Confirm Appointment</h3>

      <div className="confirm-summary">
        <div className="confirm-service">{serviceName}</div>
        <div className="confirm-date">{dateDisplay}</div>
        <div className="confirm-time">{timeDisplay}</div>
      </div>

      <button className="confirm-btn" onClick={handleConfirm}>
        Confirm
      </button>
    </div>
  );
}
