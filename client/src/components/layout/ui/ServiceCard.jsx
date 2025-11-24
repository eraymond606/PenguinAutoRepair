// src/components/layout/ui/ServiceCard.jsx
import React from "react";

export default function ServiceCard({ title, img }) {
  return (
    <article className="service-card">
      <div className="media">
        <img src={img} alt={title} loading="lazy" />
        <span className="label">{title}</span>
      </div>
    </article>
  );
}
// client/src/pages/Home.jsx