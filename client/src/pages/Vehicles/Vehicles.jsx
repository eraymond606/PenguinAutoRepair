import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Vehicles.module.css";

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
    <div className={styles.pageWrapper}>
      <div className={styles.hero} style={{ backgroundImage: 'url(/images/hero.jpg)' }}></div>
      <div className={styles.container}>
        <h1 className={styles.heroTitle}>Vehicles</h1>
        
        <h2 className={styles.formHeading}>
          Add a <span className={styles.highlight}>New Vehicle</span>
        </h2>
            
            <form className={styles.form} onSubmit={handleSave}>
              <input 
                name="make" 
                placeholder="Make" 
                value={form.make} 
                onChange={handleChange}
                className={styles.input}
              />
              <input 
                name="color" 
                placeholder="Color" 
                value={form.color} 
                onChange={handleChange}
                className={styles.input}
              />
              <input 
                name="model" 
                placeholder="Model" 
                value={form.model} 
                onChange={handleChange}
                className={styles.input}
              />
              <input 
                name="vin" 
                placeholder="VIN Number" 
                value={form.vin} 
                onChange={handleChange}
                className={styles.input}
              />
              <input 
                name="year" 
                placeholder="Year" 
                value={form.year} 
                onChange={handleChange}
                className={styles.input}
              />
              <input 
                name="plate" 
                placeholder="License Plate" 
                value={form.plate} 
                onChange={handleChange}
                className={styles.input}
              />
              
              <button type="submit" className={styles.submitBtn}>
                Submit
              </button>
            </form>
            
            {vehicles.length > 0 && (
              <div className={styles.continueSection}>
                <button 
                  type="button" 
                  className={styles.continueBtn} 
                  onClick={() => navigate("/schedule")}
                >
                  Continue to Schedule Appointment
                </button>
              </div>
            )}
      </div>
    </div>
  );
}
