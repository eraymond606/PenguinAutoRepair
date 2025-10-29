
// client/src/components/MobileHome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../MobileHome.css';
import engineerImg from '../assets/engineer.png';
import logo192 from '../assets/logo192.png';

export default function MobileHome() {
  const navigate = useNavigate();

  return (
    <div className="mobile-frame mobile-home">
  <div className="bubbles">
        {/* edge bubbles */}
        <span className="bubble edge edge-right"></span>
        <span className="bubble edge edge-left"></span>
        <span className="bubble big-top-left"></span>


        {/* medium bubbles */}
        <span className="bubble m b1"></span>
        <span className="bubble m b2"></span>
        <span className="bubble m b3"></span>

        {/* small bubbles */}
        <span className="bubble s s1"></span>
        <span className="bubble s s2"></span>
        <span className="bubble s s3"></span>
        <span className="bubble s s4"></span>

        {/* tiny bubbles */}
        <span className="speckles top"></span>
        <span className="speckles mid"></span>
        <span className="speckles bottom"></span>
      </div>
      

      <div className="logo-section">
        <img src={logo192} alt="Penguin Logo" className="mobile-logo" />
        <h2>Welcome to</h2>
        <h1>Penguin Auto Repair Shop</h1>
      </div>

      <div className="hero-wrap">
        <img src={engineerImg} alt="Engineer" className="engineer-img" />
      </div>

      <p className="mobile-description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <button 
        className="schedule-btn"
        onClick={() => navigate('/mobile/login')}
      >
        Schedule Service
      </button>
    </div>
  );
}
