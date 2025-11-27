import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Schedule.module.css";
import * as api from "../../lib/api";

function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  let day = 1;
  for (let i = 0; i < startDay; i++) week[i] = null;
  for (; day <= daysInMonth; ) {
    for (let i = (week.findIndex((d) => d === null) === -1 ? 0 : week.findIndex((d) => d === null)); i < 7 && day <= daysInMonth; i++) {
      week[i] = new Date(year, month, day);
      day++;
    }
    weeks.push(week);
    week = new Array(7).fill(null);
  }
  return weeks;
}

export default function Schedule() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(null);
  const [service, setService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const today = useMemo(() => new Date(), []);
  const displayMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthMatrix = useMemo(() => buildMonthMatrix(displayMonth.getFullYear(), displayMonth.getMonth()), [displayMonth]);

  const prevMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1);
  const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);

  useEffect(() => {
    async function loadTimes() {
      if (!service || !selectedDate) return setAvailableTimes([]);
      setLoadingTimes(true);
      try {
        const iso = selectedDate.toISOString();
        const times = await api.getAvailableTimes({ service, date: iso });
        setAvailableTimes(times);
      } catch (e) {
        console.error(e);
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    }
    loadTimes();
  }, [service, selectedDate]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("vehicles");
      if (raw) setVehicles(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load vehicles", e);
      setVehicles([]);
    }
  }, []);

  const confirm = async () => {
    if (selectedVehicleIndex === null) {
      alert("Please select a vehicle before confirming.");
      return;
    }
    if (!service || !selectedDate || !selectedTime) {
      alert("Please select service, date and time.");
      return;
    }
    setConfirming(true);
    try {
      const iso = selectedDate.toISOString();
      const appt = await api.createAppointment({ service, date: iso });
      appt.time = selectedTime;
      appt.vehicle = vehicles[selectedVehicleIndex] || null;
      sessionStorage.setItem("lastAppointment", JSON.stringify(appt));
      navigate("/appointment-confirmed");
    } catch (e) {
      console.error(e);
      alert("Unable to schedule appointment.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.hero} style={{ backgroundImage: 'url(/images/hero.jpg)' }}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Schedule Appointment</h1>
        </div>
      </div>
      <div className={styles.scheduleGrid}>
        <div className={styles.calendarCol}>
          <div className={styles.monthControls}>
            <button onClick={() => setMonthOffset((m) => m - 1)} aria-label="Previous month">&lt;</button>
            <div className={styles.monthTabs}>
              <button className={styles.monthTab} onClick={() => setMonthOffset((m) => m - 1)}>{prevMonth.toLocaleString(undefined, { month: "short" })}</button>
              <button className={`${styles.monthTab} ${styles.current}`}>{displayMonth.toLocaleString(undefined, { month: "short" })} {displayMonth.getFullYear()}</button>
              <button className={styles.monthTab} onClick={() => setMonthOffset((m) => m + 1)}>{nextMonth.toLocaleString(undefined, { month: "short" })}</button>
            </div>
            <button onClick={() => setMonthOffset((m) => m + 1)} aria-label="Next month">&gt;</button>
          </div>

          <table className={styles.calendar}>
            <thead>
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              {monthMatrix.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) => (
                    <td key={di} className={d && selectedDate && d.toDateString() === selectedDate.toDateString() ? styles.selected : ""}>
                      {d ? (
                        <button className={styles.dayBtn} onClick={() => setSelectedDate(d)}>{d.getDate()}</button>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.timesCol}>
          <div className={styles.serviceSelect}>
            <label>Select Vehicle</label>
            <div style={{ marginTop: 8 }}>
              <div className={styles.vehicleList} style={{ justifyContent: "flex-start" }}>
                {vehicles.map((v, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    className={`${styles.vehicleCard} ${selectedVehicleIndex === i ? styles.selectedCard : ""}`}
                    onClick={() => setSelectedVehicleIndex(i)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedVehicleIndex(i)}
                  >
                    <div className={styles.vehicleLine}>{v.year} {v.make} {v.model}</div>
                    {v.plate && <div className={styles.vehicleSub}>Plate: {v.plate}</div>}
                  </div>
                ))}

                <div className={`${styles.vehicleCard} ${styles.addCard}`} onClick={() => navigate("/vehicles")} role="button" aria-label="Add vehicle">+</div>
              </div>
            </div>
          </div>

          <div className={styles.serviceSelect}>
            <label>Select Service</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">Service</option>
              <option>AC Filter</option>
              <option>Alignment</option>
              <option>Back Up Camera</option>
              <option>Diagnostic</option>
              <option>Oil Change</option>
              <option>Tire Replacement</option>
            </select>
          </div>

          <div className={styles.timesList}>
            <h3>Select Time</h3>
            {loadingTimes ? (
              <p>Loading times…</p>
            ) : availableTimes.length === 0 ? (
              <p className={styles.muted}>Choose a service and date to view available times.</p>
            ) : (
              <div className={styles.timeGrid}>
                {availableTimes.map((t) => (
                  <button key={t} className={t === selectedTime ? `${styles.timeSlot} ${styles.selectedSlot}` : styles.timeSlot} onClick={() => setSelectedTime(t)}>{t}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.confirmCol}>
          <h3>Confirm<br/>Appointment</h3>
          <div className={styles.confirmBox}>
            <div><strong>{service || "Oil Change"}</strong></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2a3f52', marginBottom: '4px' }}>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : "9/18/25"}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#023746' }}>
              {selectedTime || "9:30 AM"}
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={confirm} disabled={confirming}>{confirming ? "Confirming…" : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
