import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileSignup.css';
import logo192 from '../assets/logo192.png';
import { authSignup } from './Api';

const MIN_LEN = 8;

export default function MobileSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // simple validation state
  const [touched, setTouched] = useState({ password: false });
  const [errors, setErrors] = useState({ password: '' });
  const pwdRef = useRef(null);

  const validatePassword = (value) => {
    if (!value || value.length < MIN_LEN) {
      return `Password must be at least ${MIN_LEN} characters.`;
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one capital letter.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      return 'Password must contain at least one symbol.';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number.';
    }
    return '';
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = {
      ...form,
      [name]: name === 'phone' ? value.replace(/[^\d\-()+\s]/g, '') : value
    };
    setForm(next);

    if (name === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(next.password) }));
    }
  };

  const onBlur = (e) => {
    const { name } = e.target;
    if (name === 'password') {
      setTouched((t) => ({ ...t, password: true }));
      setErrors((prev) => ({ ...prev, password: validatePassword(form.password) }));
    }
  };

const onSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

   // check before submit
    const pwdErr = validatePassword(form.password);
    if (pwdErr) {
      setTouched((t) => ({ ...t, password: true }));
      setErrors((prev) => ({ ...prev, password: pwdErr }));
      // focus password field
      pwdRef.current?.focus();
      return;
    }

  setLoading(true);
  try {
      const { data } = await authSignup(form);
      if (data?.ok) {
        // success → route user to login
        // (You requested: sign up then have them log in)
        navigate('/mobile/login', { state: { signedUp: true } });
      } else if (data?.error === 'email-exists') {
        alert('That email is already registered. Try logging in.');
        navigate('/mobile/login');
      } else if (data?.error === 'weak-password') {
        // backend safeguard — show same message
        setTouched((t) => ({ ...t, password: true }));
        setErrors((prev) => ({ ...prev, password: `Password must be at least ${MIN_LEN} characters.` }));
        pwdRef.current?.focus();
      } else {
        alert('Could not sign up. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwdInvalid = touched.password && !!errors.password;


  return (
    <div className="mobile-frame signup-screen">
      {/* bubbles from CSS */}
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

      <button className="back-link" onClick={() => navigate(-1)}>Back</button>

      <img src={logo192} alt="Penguin Mechanic" className="signup-logo" />

      <h3 className="signup-title">Sign Up</h3>

      <form className="signup-form" onSubmit={onSubmit} noValidate>
        <input
          name="first_name"
          value={form.first_name}
          onChange={onChange}
          placeholder="First Name"
          className="signup-input"
          autoComplete="given-name"
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={onChange}
          placeholder="Last Name"
          className="signup-input"
          autoComplete="family-name"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="Phone Number"
          className="signup-input"
          inputMode="tel"
          autoComplete="tel"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="signup-input"
          autoComplete="email"
        />
        <div className="field-wrapper">
          <input
            ref={pwdRef}
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Create Password"
            className={`signup-input ${pwdInvalid ? 'invalid' : ''}`}
            autoComplete="new-password"
            aria-invalid={pwdInvalid ? 'true' : 'false'}
            aria-describedby="password-requirements"
          />
          {pwdInvalid && (
            <div role="alert" className="field-pop">
              {errors.password}
            </div>
          )}
          <div id="password-requirements" className="req-text">
            Password requirements: at least <b>{MIN_LEN}</b> characters, at least one capital letter, at least one symbol (! _ +, *, or =), and at least one number (1-9).
          </div>
        </div>

        <button type="submit" className="signup-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
