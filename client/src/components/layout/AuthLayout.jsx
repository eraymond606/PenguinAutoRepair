import React from "react";
import "../../styles/Auth.css";

export default function AuthLayout({ title, children, hero = "/images/hero.jpg", showDots = true }) {
  return (
    <div className="auth-page">
      {/* Hero section matching home page style */}
      <section
        className="hero"
        style={{ backgroundImage: `url('${hero}')` }}
      />

      <main>{children}</main>
    </div>
  );
}
