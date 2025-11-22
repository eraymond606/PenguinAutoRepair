// client/src/components/MobileCustomerResults.js
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileCustomerResults.css';
import logo192 from '../assets/logo192.png';
import { fetchCustomerVehicles } from './Api'; // make sure this exists in Api.js

export default function MobileCustomerResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // state passed via navigation (when coming from login, new vehicle, etc.)
  const navState = location.state || {};

  // cached data from earlier visits
  const cached = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('customerResults') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [customer, setCustomer] = useState(
    () => navState.customer || cached.customer || null
  );
  const [vehicles, setVehicles] = useState(
    () => navState.vehicles || cached.vehicles || []
  );
  const [loading, setLoading] = useState(false);

  // If we have a customer but vehicles array is empty, try to fetch from API
  useEffect(() => {
    if (!customer || vehicles.length > 0) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await fetchCustomerVehicles(customer.customer_id);
        if (data?.ok) {
          setVehicles(data.vehicles || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [customer, vehicles.length]);

  // Cache customer + vehicles whenever they change
  useEffect(() => {
    if (customer) {
      sessionStorage.setItem(
        'customerResults',
        JSON.stringify({ customer, vehicles })
      );
    }
  }, [customer, vehicles]);

  // Back should go to a stable page, NOT back in history
  const handleBack = () => {
    navigate('/mobile/login'); // or '/mobile' if you want home instead
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('customerId');
  navigate('/mobile/login');
};

  // If somehow we got here with no customer, show a friendly message
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

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            paddingTop: 48,
          }}
        >
          <h3 style={{ color: '#2b5f85', marginBottom: 8 }}>
            No customer loaded
          </h3>
          <p style={{ color: '#6a8598', marginBottom: 16 }}>
            Please log in again.
          </p>
          <button
            className="vehicle-card"
            style={{ maxWidth: 220, margin: '0 auto' }}
            onClick={() => navigate('/mobile/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Capitalize first name (even if not capitalized in DB)
  const firstName = customer.first_name
    ? customer.first_name.charAt(0).toUpperCase() + customer.first_name.slice(1).toLowerCase()
    : 'Customer';

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

      <button className="back-link" onClick={handleBack}>
        Back
      </button>

      <img src={logo192} alt="Penguin Mechanic" className="results-logo" />

      <div className="greeting">
        <div className="hello">Hello,</div>
        <div className="name">{firstName}</div>
      </div>

      <h3 className="section-title">Select Vehicle</h3>

      <div className="vehicle-list">
        {loading && (
          <div style={{ textAlign: 'center', color: '#6a8598' }}>
            Loading vehicles…
          </div>
        )}

        {!loading &&
          vehicles.map((v) => (
            <button
              key={v.vehicle_id ?? v.id}
              className="vehicle-card"
              onClick={() =>
                navigate('/mobile/schedule', { state: { customer, vehicle: v } })
              }
            >
              <div className="vehicle-line">
                {v.year} {v.make} {v.model}
              </div>
              <div className="vehicle-sub">
                Plate: {v.plate_number || 'N/A'}
              </div>
            </button>
          ))}

        {!loading && (
          <button
            className="vehicle-card add-card"
            onClick={() =>
              navigate('/mobile/new-vehicle', { state: { customer } })
            }
            aria-label="Add Vehicle"
            title="Add Vehicle"
          >
            <span className="plus">+</span>
          </button>
        )}
        {!loading && (
          <button
            className="vehicle-card logout-card"
            onClick={handleLogout}
            style={{
              backgroundColor: '#fff',
              color: '#3498db',
              border: '2px solid #3498db',
              fontWeight: '600',
              marginTop: '16px'
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
