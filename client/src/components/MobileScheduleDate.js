// client/src/components/MobileScheduleDate.js
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../MobileScheduleDate.css';
import logo192 from '../assets/logo192.png';

// build slots from 9:00 to 5:00 (30-min increments)
function buildSlots(startHour = 9, endHour = 17) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({ id: `${h}:00`, label: formatTime(h, 0) });
    slots.push({ id: `${h}:30`, label: formatTime(h, 30) });
  }
  return slots;
}

function formatTime(hour24, minute) {
  let h = hour24;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  const mm = minute.toString().padStart(2, '0');
  return `${h}:${mm} ${ampm}`;
}

export default function MobileScheduleDate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, vehicle, service_id, service } = location.state || {};

  // calendar + time state
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const slots = useMemo(() => buildSlots(9, 17), []);

  // --- calendar helpers ---
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const monthLabel = currentMonth.toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });

  const days = useMemo(() => {
    const firstDay = startOfMonth.getDay(); // 0=Sun
    const numDays = endOfMonth.getDate();
    const arr = [];

    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) {
      arr.push(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          d
        )
      );
    }
    return arr;
  }, [startOfMonth, endOfMonth, currentMonth]);

  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const changeMonth = (delta) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + delta,
        1
      )
    );
  };

  const onSelect = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please choose a time.');
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateISO = `${year}-${month}-${day}`;

    navigate('/mobile/confirm', {
      state: {
        customer,
        vehicle,
        service_id,
        service,
        dateISO,
        slot: selectedSlot,
      },
    });
  };

  const visibleSlots = expanded ? slots : slots.slice(0, 3);

  return (
    <div className="mobile-frame calendar-screen">
      <button
        type="button"
        className="back-link"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="bubbles">
        <span className="bubble edge edge-right"></span>
        <span className="bubble edge edge-left"></span>
        <span className="bubble big-top-left"></span>
        <span className="bubble m b1"></span>
        <span className="bubble m b2"></span>
        <span className="bubble m b3"></span>
        <span className="bubble s s1"></span>
        <span className="bubble s s2"></span>
        <span className="bubble s s3"></span>
        <span className="bubble s s4"></span>
      </div>

      <img src={logo192} alt="Penguin Mechanic" className="cal-logo" />
      <h3 className="cal-title">Select Service Time</h3>

      {/* Month strip */}
      <div className="cal-month-strip">
        <button
          type="button"
          className="cal-month-arrow"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <div className="cal-month-label">{monthLabel}</div>
        <button
          type="button"
          className="cal-month-arrow"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="cal-dow-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="cal-dow-cell">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
        {days.map((d, idx) => {
          if (!d) return <div key={idx} className="cal-cell empty" />;

          const selected = isSameDay(d, selectedDate);
          return (
            <button
              key={idx}
              type="button"
              className={`cal-cell day ${selected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Bottom sheet for time selection */}
      <form
        className={`time-sheet ${expanded ? 'expanded' : 'collapsed'}`}
        onSubmit={onSelect}
      >
        <button
          type="button"
          className="time-sheet-toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={`time-sheet-arrow ${expanded ? 'down' : 'up'}`} />
        </button>

        <div className="time-sheet-title">Select Time</div>

        <div className="time-grid">
          {visibleSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={
                'time-pill' +
                (selectedSlot?.id === slot.id ? ' active' : '')
              }
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.label}
            </button>
          ))}
        </div>

        <button type="submit" className="time-select-btn">
          Select
        </button>
      </form>
    </div>
  );
}

