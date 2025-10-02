import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileLookup.css';
import logo192 from '../assets/logo192.png';
import { lookupCustomer } from './Api';

export default function MobileLookup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first: '', last: '', phone: '' });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await lookupCustomer({
      first: form.first,
      last: form.last,
      phone: form.phone,
    });

    if (data?.ok && data.customer) {
      // cache for refresh/direct url
       sessionStorage.setItem(
    'customerResults',
    JSON.stringify({ customer: data.customer, vehicles: data.vehicles || [] })
  );

  navigate('/mobile/customer-results', {
    state: { customer: data.customer, vehicles: data.vehicles || [] },
  });
    } else {
      // not found → new customer flow
      navigate('/mobile/new-customer', {
        state: { first: form.first, last: form.last, phone: form.phone },
      });
    }
  } catch (err) {
    // if 404, treat as new-customer
    if (err?.response?.status === 404) {
      navigate('/mobile/new-customer', {
        state: { first: form.first, last: form.last, phone: form.phone },
      });
    } else {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  }
};

  return (
    <div className="mobile-frame lookup-screen">
      {/* Reuse bubble styles in MobileHome.css */}
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

      <div className="lookup-content">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          Back
        </button>

        <img src={logo192} alt="Penguin Mechanic" className="lookup-logo" />

        <h2 className="lookup-title">Customer Lookup</h2>

        <form className="lookup-form" onSubmit={onSubmit}>
          <input
            name="first"
            value={form.first}
            onChange={onChange}
            placeholder="First Name"
            className="lookup-input"
            autoComplete="given-name"
          />
          <input
            name="last"
            value={form.last}
            onChange={onChange}
            placeholder="Last Name"
            className="lookup-input"
            autoComplete="family-name"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone Number"
            className="lookup-input"
            inputMode="tel"
            autoComplete="tel"
          />

          <button type="submit" className="lookup-submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

