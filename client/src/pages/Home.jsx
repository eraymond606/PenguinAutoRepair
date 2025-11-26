// client/src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import ServicesCarousel from "../components/layout/ui/ServicesCarousel";

export default function Home() {
  const navigate = useNavigate();
  const heroImage = "/images/hero.jpg";

  return (
    <div className="auth-page">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero section with background + button */}
        <section
          className="hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <button
            className="btn btn--lg btn--shadow"
            onClick={() => navigate("/login")}
          >
            Schedule Service
          </button>
        </section>

        {/* Intro section */}
        <section className="intro">
          <img className="badge" src="/logo.png" alt="Penguin" />
          <div>
            <h1>Penguin Auto Repair Shop</h1>
            <p className="muted">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur.
            </p>
          </div>
        </section>

        {/* Carousel */}
        <ServicesCarousel />
      </div>
    </div>
  );
}
// client/src/pages/Home.jsx