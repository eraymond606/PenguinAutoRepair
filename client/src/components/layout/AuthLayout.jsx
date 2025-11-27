import React from "react";
import "../../styles/Auth.css";

export default function AuthLayout({ title, children, hero = "/images/hero.jpg", showDots = true, transparent = false }) {
  return (
    <div className={`auth-page ${transparent ? 'transparent-page' : ''}`}>
      <section
        className="hero"
        style={{ backgroundImage: `url('${hero}')` }}
      />

      <main>{children}</main>
    </div>
  );
}
