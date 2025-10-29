// client/src/components/MobileCustomerResults.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileCustomerResults.css';
import logo192 from '../assets/logo192.png';

export default function MobileCustomerResults() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Prefer state from navigation
  let customer = state?.customer ?? null;
  let vehicles = state?.vehicles ?? [];

  // Fallback to session cache 
  if (!customer) {
    try {
      const cached = JSON.parse(sessionStorage.getItem('customerResults') || 'null');
      if (cached?.customer) {
        customer = cached.customer;
        vehicles = cached.vehicles || [];
      }
    } catch {
      /* ignore */
    }
  }

  // Show a message instead of blank
  if (!customer) {
    return (
      <div className="mobile-frame results-screen">
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

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 48 }}>
          <h3 style={{ color: '#2b5f85', marginBottom: 8 }}>No customer loaded</h3>
          <p style={{ color: '#6a8598', marginBottom: 16 }}>
            Please search again.
          </p>
          <button
            className="vehicle-card"
            style={{ maxWidth: 220, margin: '0 auto' }}
            onClick={() => navigate('/mobile/lookup')}
          >
            Go to Lookup
          </button>
        </div>
      </div>
    );
  }

  const firstName = customer.first_name || 'Customer';

  return (
    <div className="mobile-frame results-screen">
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

      <img src={logo192} alt="Penguin Mechanic" className="results-logo" />

      <div className="greeting">
        <div className="hello">Hello,</div>
        <div className="name">{firstName}</div>
      </div>

      <h3 className="section-title">Select Vehicle</h3>

      <div className="vehicle-list">
        {vehicles.map(v => (
          <button
            key={v.vehicle_id ?? v.id}
            className="vehicle-card"
            onClick={() => navigate('/mobile/schedule', { state: { customer, vehicle: v } })}

          >
            <div className="vehicle-line">
              {[
                v.color?.trim(),
                v.make?.trim(),
                v.model?.trim(),
                v.year
              ].filter(Boolean).join(', ')}
            </div>
          </button>
        ))}

        <button
          className="vehicle-card add-card"
          onClick={() => navigate('/mobile/new-vehicle', { state: { customer } })}
          aria-label="Add Vehicle"
          title="Add Vehicle"
        >
          <span className="plus">+</span>
        </button>
      </div>
    </div>
  );
}
