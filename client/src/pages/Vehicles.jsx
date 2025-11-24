import React, { useState } from "react";
import "../styles/Auth.css";

export default function Vehicles() {
  const [vehicles] = useState([
    { make: "Honda", model: "Accord", year: 2020 },
    { make: "Nissan", model: "Sentra", year: 2018 },
  ]);

  return (
    <div className="auth-page">
      <h1 className="auth-title">Vehicles</h1>
      <p>Hello, Jane</p>

      <div className="vehicle-list">
        {vehicles.map((v, i) => (
          <div key={i} className="vehicle-card">
            {v.year}, {v.make} {v.model}
          </div>
        ))}

        <div className="vehicle-card add-card">+</div>
      </div>
    </div>
  );
}
// client/src/pages/Vehicles.jsx