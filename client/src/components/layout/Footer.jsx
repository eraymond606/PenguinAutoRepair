// client/src/components/layout/Footer.jsx
import React from "react";
import "../../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="sitefooter">
      <div className="footer-inner">
        {/* LEFT BLOCK */}
        <div className="foot-left">
          <div className="brandline">
            <img src="/logo.png" alt="Penguin Auto" />
            <div>
              <div className="brand">Penguin Auto Repair Shop</div>
              <div className="sub">Family owned & operated</div>
            </div>
          </div>

          <nav className="foot-links" aria-label="Footer">
            <a href="/contact">Contact Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
          </nav>

          <div className="copy">©2025 Penguin Auto Repair Shop. All rights reserved.</div>
        </div>

        <div className="foot-spacer" />

        {/* RIGHT BLOCK */}
        <div className="foot-right">
          <div className="addr">123 Address St, City, ST 12345</div>
          <div className="socials" aria-label="Social media">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">i</a>
            <a href="#" aria-label="Twitter / X">t</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
