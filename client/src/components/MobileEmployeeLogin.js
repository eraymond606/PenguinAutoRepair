import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileEmployeeLogin.css';
import logo192 from '../assets/logo192.png';
import axios from 'axios';

export default function MobileEmployeeLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ technicianId: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    // Only allow digits for technician ID
    if (name === 'technicianId') {
      const filtered = value.replace(/\D/g, '').slice(0, 6);
      setForm((f) => ({ ...f, [name]: filtered }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.technicianId || !form.password) {
      alert('Please enter both Technician ID and Password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/employee/login', {
        technician_id: form.technicianId,
        password: form.password
      });

      if (data?.ok && data.technician) {
        // Store technician info
        sessionStorage.setItem(
          'employeeData',
          JSON.stringify({ technician: data.technician })
        );

        // Role-based routing
        if (data.technician.position?.toLowerCase() === 'manager') {
          navigate('/mobile/manager/select');
        } else {
          navigate('/mobile/employee/schedule');
        }
      } else {
        alert('Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      if (errorMsg === 'invalid-credentials') {
        alert('Invalid Technician ID or Password.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-frame employee-login-screen">
      <button className="back-link" onClick={() => navigate('/mobile')}>Back</button>

      <img src={logo192} alt="Penguin Mechanic" className="employee-login-logo" />

      <h3 className="employee-login-title">Employee Sign In</h3>

      <form className="employee-login-form" onSubmit={onSubmit} noValidate>
        <input
          name="technicianId"
          type="text"
          inputMode="numeric"
          value={form.technicianId}
          onChange={onChange}
          placeholder="Technician ID"
          className="employee-login-input"
          autoComplete="username"
          maxLength="6"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="employee-login-input"
          autoComplete="current-password"
        />

        <div className="forgot-row">
          <button
            type="button"
            className="link-forgot"
            onClick={() => navigate('/mobile/employee/forgot')}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="employee-login-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
