import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileEmployeeSchedule.css';
import { getTechnicianAppointments } from './Api';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function MobileEmployeeSchedule() {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicianName, setTechnicianName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    // Get technician info from session
    const employeeData = sessionStorage.getItem('employeeData');
    if (!employeeData) {
      navigate('/mobile/employee/login');
      return;
    }

    const parsed = JSON.parse(employeeData);
    const technician = parsed?.technician;
    if (!technician?.technician_id) {
      navigate('/mobile/employee/login');
      return;
    }

    setTechnicianName(`${technician.first_name} ${technician.last_name}`);
    loadSchedule(technician.technician_id);
  }, [navigate]);

  const loadSchedule = async (technicianId) => {
    try {
      setLoading(true);
      const { data } = await getTechnicianAppointments(technicianId);
      if (data?.ok) {
        setAllAppointments(data.appointments || []);
        const grouped = groupAppointmentsByDate(data.appointments || []);
        setScheduleData(grouped);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
      alert('Could not load schedule');
    } finally {
      setLoading(false);
    }
  };

  const groupAppointmentsByDate = (appointments) => {
    // Create a map of date -> count
    const dateMap = {};
    appointments.forEach((appt) => {
      const date = new Date(appt.start_time).toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    // Generate next 14 days
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const count = dateMap[dateStr] || 0;

      days.push({
        date: date,
        dateStr: dateStr,
        count: count,
        isOff: count === 0
      });
    }

    return days;
  };

  const formatDayDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${dayName} ${month}/${day}`;
  };

  const formatApptCount = (count) => {
    if (count === 0) return 'OFF';
    if (count === 1) return '1 appt.';
    return `${count} appts.`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startDay = String(startDate.getDate()).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    return `${startMonth}/${startDay}-${endMonth}/${endDay}`;
  };

  const isStartOfNextWeek = (date, index) => {
    return index === 7;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('employeeData');
    navigate('/mobile/employee/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOption = (option) => {
    setMenuOpen(false);
    if (option === 'schedule') {
      navigate('/mobile/employee/schedule');
    } else if (option === 'logout') {
      handleLogout();
    }
  };

  const handleDayClick = (day) => {
    if (day.isOff) return;

    // Filter appointments for this day
    const appts = allAppointments.filter((appt) => {
      const apptDate = new Date(appt.start_time).toISOString().split('T')[0];
      return apptDate === day.dateStr;
    });

    setDayAppointments(appts);
    setSelectedDay(day);
  };

  const handleClosePopup = () => {
    setSelectedDay(null);
    setDayAppointments([]);
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/mobile/employee/appointment/${appointmentId}`);
  };

  const formatCustomerName = (firstName, lastName) => {
    return `${capitalize(firstName)} ${capitalize(lastName).charAt(0)}.`;
  };

  return (
    <div className="mobile-frame employee-schedule-screen">
      <div className="schedule-header">
        <h2 className="schedule-title">My Schedule</h2>
        <div className="menu-container">
          <button className="hamburger-menu" aria-label="Menu" onClick={toggleMenu}>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
          {menuOpen && (
            <>
              <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
              <div className="dropdown-menu">
                <button className="menu-item" onClick={() => handleMenuOption('schedule')}>
                  Schedule
                </button>
                <button className="menu-item" onClick={() => handleMenuOption('logout')}>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="schedule-content">
        {loading ? (
          <div className="loading-message">Loading schedule...</div>
        ) : (
          <div className="schedule-list">
            {scheduleData.map((day, index) => (
              <React.Fragment key={day.dateStr}>
                {isStartOfNextWeek(day.date, index) && (
                  <div className="week-separator">
                    <span className="week-label">Next week</span>
                    <span className="week-range">{getWeekRange(day.date)}</span>
                  </div>
                )}
                <div
                  className={`schedule-day ${day.isOff ? 'off' : 'working'}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="day-date">{formatDayDate(day.date)}</span>
                  <span className="day-count">{formatApptCount(day.count)}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Day Appointments Popup */}
      {selectedDay && (
        <div className="appointments-popup-overlay" onClick={handleClosePopup}>
          <div className="appointments-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className={`popup-day-badge working`}>
                <span className="day-date">{formatDayDate(selectedDay.date)}</span>
                <span className="day-count">{formatApptCount(selectedDay.count)}</span>
              </div>
            </div>

            <h3 className="popup-title">Upcoming Appointments</h3>

            <div className="popup-appointments-list">
              {dayAppointments.map((appt) => (
                <button
                  key={appt.appointment_id}
                  className="popup-appointment-item"
                  onClick={() => handleAppointmentClick(appt.appointment_id)}
                >
                  <span className="appt-customer-name">
                    {formatCustomerName(appt.customer_first_name, appt.customer_last_name)}
                  </span>
                  <span className="appt-time">{formatTime(appt.start_time)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
