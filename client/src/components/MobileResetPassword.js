import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../MobileResetPassword.css';
import logo192 from '../assets/logo192.png';
import { authResetPassword } from './Api';

export default function MobileResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one capital letter.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      return 'Password must contain at least one symbol.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!email) {
      alert('Email not found. Please start the forgot password process again.');
      navigate('/mobile/forgot');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authResetPassword({ email, new_password: password });
      if (data?.ok) {
        alert('Password reset successful! Please log in with your new password.');
        navigate('/mobile/login');
      } else {
        alert(data?.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        alert('Account not found. Please check your email.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-frame reset-screen">
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

      <img src={logo192} alt="Penguin Mechanic" className="reset-logo" />

      <h3 className="reset-title">Reset Password</h3>
      <p className="reset-subtitle">
        Reset your password. Minimum 8 characters, at least one capital letter, at least one
        symbol (! _ +, *, or =), and at least one number (1-9)
      </p>

      <form className="reset-form" onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="reset-input"
          autoComplete="new-password"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="reset-input"
          autoComplete="new-password"
        />

        <button type="submit" className="reset-submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
