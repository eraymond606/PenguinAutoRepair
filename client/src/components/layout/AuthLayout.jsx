import React from "react";
import "../../styles/Auth.css";

export default function AuthLayout({ title, children, hero = "/images/hero.jpg", showDots = true }) {
  return (
    <div className="auth-page" style={{ ["--auth-hero"]: `url('${hero}')` }}>
      {/* Title pill overlapping the hero */}
      <div className="auth-title-pill" aria-hidden>
        <h1 className="auth-title">{title}</h1>
      </div>

      {/* decorative dots overlay */}
      {showDots && <div className="auth-dots" aria-hidden />}

      <main>{children}</main>
    </div>
  );
}
