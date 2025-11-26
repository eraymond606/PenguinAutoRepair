import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Vehicles.module.css";
import AuthLayout from "../../components/layout/AuthLayout";

const STORAGE_KEY = "vehicles";

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ make: "", color: "", model: "", vin: "", year: "", plate: "" });

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setVehicles(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse vehicles from storage", e);
      }
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    // minimal validation
    if (!form.make || !form.model || !form.year) {
      alert("Please provide at least year, make and model.");
      return;
    }

    const next = [...vehicles, { ...form }];
    setVehicles(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setForm({ make: "", color: "", model: "", vin: "", year: "", plate: "" });
  };

  return (
    <AuthLayout title="Vehicles" showDots={false}>
      <div className={styles.pageContent}>
        <div className={styles.pageHero}>
          <h1 className={styles.title}>Vehicles</h1>
        </div>
        <div className={styles.formSection}>
          <h2 className={styles.formHeading}>Add a <span className={styles.formNew}>New Vehicle</span></h2>
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <input name="make" placeholder="Make" value={form.make} onChange={handleChange} />
              <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
              <input name="model" placeholder="Model" value={form.model} onChange={handleChange} />
              <input name="vin" placeholder="VIN Number" value={form.vin} onChange={handleChange} />
              <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />
              <input name="plate" placeholder="License Plate" value={form.plate} onChange={handleChange} />
            </div>
            <button type="submit" className={styles.formSubmit}>Submit</button>
          </form>
          
          {vehicles.length > 0 && (
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <button 
                type="button" 
                className={styles.scheduleBtn} 
                onClick={() => navigate("/schedule")}
              >
                Continue to Schedule Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
