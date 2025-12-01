import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManagerSelect.css';
import logo192 from '../assets/logo192.png';

export default function MobileManagerSelect() {
  const navigate = useNavigate();

  const menuOptions = [
    { label: 'View Team Schedule', path: '/mobile/manager/appointments' },
    { label: 'Manage Employees', path: '/mobile/manager/employees' },
    { label: 'Manage Parts & Vendors', path: '/mobile/manager/parts' },
    { label: 'Manage Services', path: '/mobile/manager/services' },
    { label: 'Manage Invoices', path: '/mobile/manager/invoices' },
    { label: 'Manage Customers', path: '/mobile/manager/customers' },
    { label: 'View Transactions', path: '/mobile/manager/transactions' },
  ];

  const handleOptionClick = (option) => {
    if (option.path) {
      navigate(option.path);
    } else {
      alert('This feature is coming soon!');
    }
  };

  const handleBack = () => {
    // Clear employee session and go back to employee login
    sessionStorage.removeItem('employeeData');
    navigate('/mobile/employee/login');
  };

  return (
    <div className="mobile-frame manager-select-screen">
      <button className="back-link" onClick={handleBack}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <img src={logo192} alt="Penguin Mechanic" className="manager-select-logo" />

      <h2 className="manager-select-title">Records Management</h2>

      <div className="manager-select-options">
        {menuOptions.map((option, index) => (
          <button
            key={index}
            className="manager-select-btn"
            onClick={() => handleOptionClick(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
