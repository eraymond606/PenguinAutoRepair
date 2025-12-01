import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManagerAppointments.css';
import { getAppointmentsGroupedByDate, getAppointmentsByDate } from './Api';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function MobileManagerAppointments() {
  const navigate = useNavigate();
  const [groupedDates, setGroupedDates] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(false);

  useEffect(() => {
    loadGroupedDates();
  }, []);

  const loadGroupedDates = async () => {
    try {
      setLoading(true);
      const { data } = await getAppointmentsGroupedByDate();
      if (data?.ok) {
        setGroupedDates(data.dates || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      alert('Could not load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsForDate = async (date) => {
    try {
      setLoadingAppts(true);
      const { data } = await getAppointmentsByDate(date);
      if (data?.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load appointments for date:', err);
      alert('Could not load appointments for this date');
    } finally {
      setLoadingAppts(false);
    }
  };

  const handleDayClick = async (date) => {
    if (expandedDate === date) {
      // Collapse if already expanded
      setExpandedDate(null);
      setAppointments([]);
    } else {
      // Expand and load appointments
      setExpandedDate(date);
      await loadAppointmentsForDate(date);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${dayName} ${month}/${day}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getWeekLabel = (dateStr, index, dates) => {
    if (index === 0) return null;

    const currentDate = new Date(dateStr);
    const prevDate = new Date(dates[index - 1].date);

    const currentWeek = getWeekNumber(currentDate);
    const prevWeek = getWeekNumber(prevDate);

    if (currentWeek !== prevWeek) {
      const weekStart = getMonday(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      return `${formatWeekDate(weekStart)} - ${formatWeekDate(weekEnd)}`;
    }
    return null;
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatWeekDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const handleAppointmentClick = (apptId) => {
    navigate(`/mobile/manager/appointment/${apptId}`);
  };

  return (
    <div className="mobile-frame manager-appointments-screen">
      <div className="manager-header">
        <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
        <h2 className="manager-title">Appointments Schedule</h2>
        <button className="hamburger-menu" aria-label="Menu">
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>
      </div>

      <div className="appointments-list">
        {loading ? (
          <div className="loading-message">Loading appointments...</div>
        ) : groupedDates.length === 0 ? (
          <div className="no-appointments">No upcoming appointments</div>
        ) : (
          groupedDates.map((item, index) => {
            const weekLabel = getWeekLabel(item.date, index, groupedDates);
            const isExpanded = expandedDate === item.date;
            const count = parseInt(item.count);

            return (
              <React.Fragment key={item.date}>
                {weekLabel && (
                  <div className="week-label">
                    <span className="week-text">Next week</span>
                    <span className="week-dates">{weekLabel}</span>
                  </div>
                )}

                <button
                  className="day-card"
                  onClick={() => handleDayClick(item.date)}
                >
                  <span className="day-date">{formatDate(item.date)}</span>
                  <span className="day-count">
                    {count} {count === 1 ? 'appt.' : 'appts.'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="expanded-appointments">
                    <h3 className="upcoming-title">Upcoming Appointments</h3>
                    {loadingAppts ? (
                      <div className="loading-appts">Loading...</div>
                    ) : (
                      <div className="appts-list">
                        {appointments.map((appt) => (
                          <button
                            key={appt.appointment_id}
                            className="appt-card"
                            onClick={() => handleAppointmentClick(appt.appointment_id)}
                          >
                            <span className="appt-customer">
                              {capitalize(appt.first_name)} {capitalize(appt.last_name).charAt(0)}.
                            </span>
                            <span className="appt-time">
                              {formatTime(appt.start_time)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
