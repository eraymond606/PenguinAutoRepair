// client/src/components/MobileAppointmentConfirmed.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileAppointmentConfirmed.css';
import logo192 from '../assets/logo192.png';

export default function MobileAppointmentConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer } = location.state || {};

  const handleReturn = () => {
    // go back to the vehicle selection screen
    if (customer) {
      navigate('/mobile/customer-results');
    }
  };

  return (
    <div className="mobile-frame confirm-done-screen">
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

      <img src={logo192} alt="Penguin Mechanic" className="confirm-done-logo" />

      <div className="confirm-done-icon">
        <span>✓</span>
      </div>

      <div className="confirm-done-text">
        <p>Your</p>
        <p>Appointment</p>
        <p>Is Confirmed!</p>
      </div>

      <button className="confirm-done-btn" onClick={handleReturn}>
        Return
      </button>
    </div>
  );
}
