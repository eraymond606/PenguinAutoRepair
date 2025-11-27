import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Vehicles.module.css";

const STORAGE_KEY = "vehicles";

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ make: "", color: "", model: "", vin: "", year: "", plate: "" });
  const [showForm, setShowForm] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [userName, setUserName] = useState("Jane");

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setVehicles(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse vehicles from storage", e);
      }
    }

    const userRaw = sessionStorage.getItem("user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user.firstName) {
          setUserName(user.firstName);
        }
      } catch (e) {
        console.error("Failed to parse user from storage", e);
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
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updated = vehicles.filter((v, i) => i !== index);
    setVehicles(updated);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.hero} style={{ backgroundImage: 'url(/images/hero.jpg)' }}></div>
      <div className={styles.container}>
        <h1 className={styles.heroTitle}>Vehicles</h1>
        
        {!showForm ? (
          <>
            <div className={styles.greeting}>Hello, {userName}</div>
            <button className={styles.manageBtn} onClick={() => setManageMode(prev => !prev)}>
              {manageMode ? "Done" : "Manage Vehicles"}
            </button>
            <div className={styles.subText}>Select vehicle or add a new one.</div>
            
            <div className={styles.vehicleGrid}>
              {vehicles.map((vehicle, index) => (
                <button
                  key={index}
                  className={styles.vehicleCard}
                  onClick={() => !manageMode && navigate("/schedule")}
                >
                  {manageMode && (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                    >
                      ×
                    </button>
                  )}
                  <div className={styles.vehicleInfo}>
                    {vehicle.color && <div>{vehicle.color}, </div>}
                    <div>{vehicle.make}</div>
                    <div>{vehicle.model}, {vehicle.year}</div>
                  </div>
                </button>
              ))}
              
              <button 
                className={`${styles.vehicleCard} ${styles.addCard}`}
                onClick={() => setShowForm(true)}
              >
                <div className={styles.plusIcon}>+</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <button 
              className={styles.backButton}
              onClick={() => setShowForm(false)}
            >
              ← Back to vehicles
            </button>
            
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
          </>
        )}
      </div>
    </div>
  );
}
