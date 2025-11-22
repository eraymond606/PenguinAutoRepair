import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileForgotPassword.css';
import logo192 from '../assets/logo192.png';

export default function MobileEmployeeForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    // Navigate to verify page with email in state
    navigate('/mobile/employee/forgot/verify', { state: { email } });
  };

  return (
    <div className="mobile-frame employee-forgot-screen">
      <button className="back-link" onClick={() => navigate('/mobile/employee/login')}>
        Back
      </button>

      <img src={logo192} alt="Penguin Mechanic" className="forgot-logo" />

      <h3 className="forgot-title">Verify Email</h3>
      <p className="forgot-subtitle">Enter the email on file</p>

      <form className="forgot-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="forgot-input"
          autoComplete="email"
        />

        <button type="submit" className="forgot-submit">
          Submit
        </button>
      </form>
    </div>
  );
}
