import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileEmployeeDashboard.css';
import logo192 from '../assets/logo192.png';

export default function MobileEmployeeDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('employeeData');
    navigate('/mobile/employee/login');
  };

  return (
    <div className="mobile-frame employee-dashboard-screen">
      <img src={logo192} alt="Penguin Mechanic" className="employee-dashboard-logo" />

      <h2 className="employee-dashboard-title">Coming Soon</h2>
      <p className="employee-dashboard-subtitle">
        Employee dashboard is under construction.
      </p>

      <button className="employee-logout-btn" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}
