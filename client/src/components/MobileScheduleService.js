import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileScheduleService.css';
import logo192 from '../assets/logo192.png';
import { getServices } from './Api';

export default function MobileScheduleService() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, vehicle } = location.state || {};

  const cached = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('customerResults') || '{}'); }
    catch { return {}; }
  }, []);
  const customerSafe = customer || cached.customer;

  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getServices();
        if (mounted && data?.ok) setServices(data.services || []);
      } catch (e) {
        console.error(e);
        alert('Could not load services.');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!selected) return alert('Please select a service.');
    // navigate('/mobile/schedule/time', { state: { customer: customerSafe, vehicle, service_id: selected } });
    alert(`Selected service_id=${selected} for vehicle_id=${vehicle?.vehicle_id}`);
  };

return (
  <div className="mobile-frame schedule-screen">
    <button type="button" className="back-link" onClick={() => navigate(-1)}>
      Back
    </button>

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

    <img src={logo192} alt="Penguin Mechanic" className="sched-logo" />
    <h3 className="sched-title">Select Service</h3>

    <form className="sched-form" onSubmit={submit}>
      <select
        className="sched-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Service</option>
        {services.map(s => (
          <option key={s.service_id} value={s.service_id}>
            {s.name} · ${Number(s.hourly_rate).toFixed(2)} × {s.default_hours}h
          </option>
        ))}
      </select>

      <button type="submit" className="sched-submit">Continue</button>
    </form>
  </div>
)};
