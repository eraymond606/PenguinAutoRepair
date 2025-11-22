import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../MobileVerifyEmail.css';
import logo192 from '../assets/logo192.png';

export default function MobileVerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 4) {
      alert('Please enter the 4-digit verification code.');
      return;
    }

    // For prototype: accept any 4-digit code
    navigate('/mobile/forgot/reset', { state: { email, code: verificationCode } });
  };

  return (
    <div className="mobile-frame verify-screen">
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

      <button className="back-link" onClick={() => navigate(-1)}>
        Back
      </button>

      <img src={logo192} alt="Penguin Mechanic" className="verify-logo" />

      <h3 className="verify-title">Verify Email</h3>
      <p className="verify-subtitle">
        A 4-digit verification code was sent to the email on file. Please enter it here.
      </p>

      <form className="verify-form" onSubmit={handleSubmit}>
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="code-input"
              autoComplete="off"
            />
          ))}
        </div>

        <button type="submit" className="verify-submit">
          Submit
        </button>
      </form>
    </div>
  );
}
