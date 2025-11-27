// src/components/layout/ui/ServiceCard.jsx
import React from "react";

export default function ServiceCard({ title, img }) {
  const titleLines = title.split(' ');
  
  return (
    <article className="service-card">
      <div className="media">
        <img src={img} alt={title} loading="lazy" />
        <span className="label">
          {titleLines.map((word, index) => (
            <React.Fragment key={index}>
              {word}
              {index < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      </div>
    </article>
  );
}
// client/src/pages/Home.jsx