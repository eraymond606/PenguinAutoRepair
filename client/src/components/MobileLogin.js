import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileLogin.css';
import logo192 from '../assets/logo192.png';
import { authLogin } from './Api';

export default function MobileLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await authLogin({
        email: form.email,
        password: form.password
      });

      if (data?.ok && data.customer) {
        // cache for refresh on results screen
        sessionStorage.setItem(
          'customerResults',
          JSON.stringify({ customer: data.customer, vehicles: data.vehicles || [] })
        );
        navigate('/mobile/customer-results', {
          state: { customer: data.customer, vehicles: data.vehicles || [] }
        });
      } else {
        alert('Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-frame login-screen">
      {/* bubbles kept from MobileHome.css */}
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

      <button className="back-link" onClick={() => navigate('/mobile')}>Back</button>

      <img src={logo192} alt="Penguin Mechanic" className="login-logo" />

      <h3 className="login-title">Sign In</h3>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="login-input"
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="login-input"
          autoComplete="current-password"
        />

        <div className="forgot-row">
          <button
          type="button"
          className="link-forgot"
          onClick={() => navigate('/mobile/forgot')}
        >
          Forgot password?
        </button>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <button
          type="button"
          className="signup-btn"
          onClick={() => navigate('/mobile/signup')}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
