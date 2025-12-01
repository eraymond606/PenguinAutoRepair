import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../MobileManagerAppointmentDetail.css';
import { getAppointmentById, getAvailableTechnicians, reassignTechnician } from './Api';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function MobileManagerAppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReassign, setShowReassign] = useState(false);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const { data } = await getAppointmentById(id);
      if (data?.ok) {
        setAppointment(data.appointment);
      } else {
        alert('Appointment not found');
        navigate(-1);
      }
    } catch (err) {
      console.error('Failed to load appointment:', err);
      alert('Could not load appointment');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTechnicians = async () => {
    try {
      setLoadingTechs(true);
      const { data } = await getAvailableTechnicians(id);
      if (data?.ok) {
        setAvailableTechs(data.available_technicians || []);
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
      alert('Could not load available technicians');
    } finally {
      setLoadingTechs(false);
    }
  };

  const handleReassignClick = async () => {
    if (!showReassign) {
      setShowReassign(true);
      await loadAvailableTechnicians();
    } else {
      setShowReassign(false);
    }
  };

  const handleTechnicianSelect = async (techId) => {
    if (techId === appointment.technician_id) {
      setShowReassign(false);
      return;
    }

    const selectedTech = availableTechs.find(t => t.technician_id === techId);
    const confirmMsg = `Reassign this appointment to ${capitalize(selectedTech?.first_name)} ${capitalize(selectedTech?.last_name)}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setReassigning(true);
      const { data } = await reassignTechnician(id, techId);
      if (data?.ok) {
        alert('Technician reassigned successfully!');
        await loadAppointment();
        setShowReassign(false);
      }
    } catch (err) {
      console.error('Failed to reassign technician:', err);
      const errorMsg = err.response?.data?.error || 'Could not reassign technician';
      alert(errorMsg);
    } finally {
      setReassigning(false);
    }
  };


  if (loading) {
    return (
      <div className="mobile-frame appointment-detail-screen">
        <div className="loading-message">Loading appointment...</div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const customerName = `${capitalize(appointment.customer_first_name)} ${capitalize(appointment.customer_last_name).charAt(0)}.`;
  const vehicleDesc = `${appointment.color || ''} ${appointment.year || ''} ${appointment.make} ${appointment.model}`.trim();
  const techName = appointment.tech_first_name && appointment.tech_last_name
    ? `${capitalize(appointment.tech_first_name)} ${capitalize(appointment.tech_last_name).charAt(0)}.`
    : 'Not assigned';

  return (
    <div className="mobile-frame appointment-detail-screen">
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
        <button className="hamburger-menu" aria-label="Menu">
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>
      </div>

      <div className="detail-content">
        <h2 className="customer-name">{customerName}</h2>

        <div className="detail-section">
          <span className="detail-label">Time:</span>
          <span className="detail-value">{appointment.formatted_start_time || 'N/A'}</span>
        </div>

        <div className="detail-section">
          <span className="detail-label">Service:</span>
          <span className="detail-value">{appointment.service_name}</span>
        </div>

        <div className="detail-section">
          <span className="detail-label">Vehicle:</span>
          <span className="detail-value">{vehicleDesc}</span>
        </div>

        <div className="detail-section">
          <span className="detail-label">License Plate:</span>
          <span className="detail-value">{appointment.plate_number || 'N/A'}</span>
        </div>

        <div className="detail-section">
          <span className="detail-label">VIN:</span>
          <span className="detail-value">{appointment.vin || 'N/A'}</span>
        </div>

        <div className="technician-section">
          <h3 className="technician-header">Assigned Technician</h3>
          <div className="technician-name">{techName}</div>

          <button
            className="reassign-button"
            onClick={handleReassignClick}
            disabled={reassigning}
          >
            {showReassign ? 'Cancel' : 'Reassign Technician'}
          </button>

          {showReassign && (
            <div className="technician-list">
              {loadingTechs ? (
                <div className="loading-techs">Loading technicians...</div>
              ) : availableTechs.length === 0 ? (
                <div className="no-techs">No available technicians</div>
              ) : (
                availableTechs.map((tech) => (
                  <button
                    key={tech.technician_id}
                    className={`tech-option ${tech.is_current ? 'current' : ''}`}
                    onClick={() => handleTechnicianSelect(tech.technician_id)}
                    disabled={reassigning}
                  >
                    <span className="tech-name">
                      {capitalize(tech.first_name)} {capitalize(tech.last_name)}
                    </span>
                    {tech.is_current && (
                      <span className="current-badge">(Current)</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
