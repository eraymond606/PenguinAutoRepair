import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileNewVehicle.css';
import logo192 from '../assets/logo192.png';
import { addVehicle } from './Api';

export default function MobileNewVehicle() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer customer_id from router state; fallback to sessionStorage (from login)
  const { customer } = location.state || {};
  const saved = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('customerResults') || '{}'); }
    catch { return {}; }
  }, []);
  const customer_id = customer?.customer_id || saved?.customer?.customer_id;

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    plate: '',
    vin: ''
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'year') v = v.replace(/[^\d]/g, '').slice(0, 4);
    setForm((f) => ({ ...f, [name]: v }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!customer_id) {
      alert('Session expired. Please log in again.');
      navigate('/mobile/login');
      return;
    }
    if (!form.make.trim() || !form.model.trim()) {
      alert('Please enter Make and Model.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await addVehicle({ customer_id, ...form });
      if (data?.ok) {
        // refresh session cache so Customer Results shows the new list
        const current = JSON.parse(sessionStorage.getItem('customerResults') || '{}');
        const next = {
          ...(current || {}),
          vehicles: data.vehicles || []
        };
        sessionStorage.setItem('customerResults', JSON.stringify(next));
        navigate('/mobile/customer-results', { state: { customer: current.customer, vehicles: data.vehicles } });
      } else if (data?.error === 'bad-year') {
        alert('Please enter a valid year between 1900 and 2100.');
      } else if (data?.error === 'invalid-customer') {
        alert('Invalid customer. Please log in again.');
        navigate('/mobile/login');
      } else if (data?.error === 'duplicate') {
        alert('That vehicle already exists.');
      } else {
        alert('Could not save vehicle. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-frame newveh-screen">
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

      <img src={logo192} alt="Penguin Mechanic" className="nv-logo" />
      <h3 className="nv-title">Add a New Vehicle</h3>

      <form className="nv-form" onSubmit={onSubmit} noValidate>
        <input name="make"  value={form.make}  onChange={onChange} placeholder="Make"  className="nv-input" />
        <input name="model" value={form.model} onChange={onChange} placeholder="Model" className="nv-input" />
        <input name="year"  value={form.year}  onChange={onChange} placeholder="Year"  className="nv-input" inputMode="numeric" />
        <input name="color" value={form.color} onChange={onChange} placeholder="Color" className="nv-input" />
        <input name="plate" value={form.plate} onChange={onChange} placeholder="License Plate" className="nv-input" />
        <input name="vin"   value={form.vin}   onChange={onChange} placeholder="VIN Number" className="nv-input" />
        <button type="submit" className="nv-submit" disabled={loading}>
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
