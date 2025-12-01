import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const [staffUser, setStaffUser] = useState(null);

  useEffect(() => {
    // Check for staff user in sessionStorage
    const token = sessionStorage.getItem("token");
    const userStr = sessionStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Check if user has staff role
        if (user.role === "staff") {
          setStaffUser(user);
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="brand">
          <div className="logo-badge" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Penguin Auto" className="logo" />
          </div>
          <span className="brand-name">Penguin Auto Repair Shop</span>
        </div>

        <div className="contact">
          <button
            className="home-button"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          
          <span className="phone">📞 1-123-123-4566</span>
          <span className="dot">•</span>
          <span className="addr">123 Address St, City, ST 12345</span>

          <button
            className="btn btn--sm btn--secondary pill"
            onClick={() => navigate("/login")}
          >
            Schedule Service
          </button>

          {staffUser ? (
            <>
              <span className="staff-indicator" style={{ marginLeft: '0.5rem', color: '#005a8d', fontSize: '14px', fontWeight: '600' }}>
                Staff: {staffUser.firstName || staffUser.email}
              </span>
              <button
                className="btn btn--sm btn--tertiary"
                onClick={() => navigate("/staff")}
                style={{ marginLeft: '0.5rem' }}
              >
                Staff Dashboard
              </button>
            </>
          ) : (
            <button
              className="btn btn--sm btn--tertiary"
              onClick={() => navigate("/staff/login")}
              style={{ marginLeft: '0.5rem' }}
            >
              Staff Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
// client/src/components/layout/Header.jsx
