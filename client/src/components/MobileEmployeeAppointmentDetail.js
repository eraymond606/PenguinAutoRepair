import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../MobileEmployeeAppointmentDetail.css';
import { getAppointmentById, getRepairByAppointment, updateRepairStatus, getParts, addRepairPart, getRepairParts } from './Api';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function MobileEmployeeAppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('in_progress');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [availableParts, setAvailableParts] = useState([]);
  const [assignedParts, setAssignedParts] = useState([]);
  const [addingPart, setAddingPart] = useState(false);

  useEffect(() => {
    // Check if employee is logged in
    const employeeData = sessionStorage.getItem('employeeData');
    if (!employeeData) {
      navigate('/mobile/employee/login');
      return;
    }

    loadAppointment();
  }, [id, navigate]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const { data } = await getAppointmentById(id);
      if (data?.ok) {
        setAppointment(data.appointment);
        // Load repair info
        await loadRepair();
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

  const loadRepair = async () => {
    try {
      const { data } = await getRepairByAppointment(id);
      if (data?.ok && data.repair) {
        setRepair(data.repair);
        setCurrentStatus(data.repair.status || 'in_progress');
        // Load assigned parts
        await loadAssignedParts(data.repair.repair_id);
      }
    } catch (err) {
      console.error('Failed to load repair:', err);
    }
  };

  const loadAssignedParts = async (repairId) => {
    try {
      const { data } = await getRepairParts(repairId);
      if (data?.ok) {
        setAssignedParts(data.parts || []);
      }
    } catch (err) {
      console.error('Failed to load assigned parts:', err);
    }
  };

  const loadAvailableParts = async () => {
    try {
      const { data } = await getParts();
      if (data?.ok) {
        setAvailableParts(data.parts || []);
      }
    } catch (err) {
      console.error('Failed to load parts:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (updatingStatus || !repair) return;

    setUpdatingStatus(true);
    try {
      const { data } = await updateRepairStatus(repair.repair_id, newStatus);
      if (data?.ok) {
        setCurrentStatus(newStatus);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenPartsModal = async () => {
    await loadAvailableParts();
    setShowPartsModal(true);
  };

  const handleClosePartsModal = () => {
    setShowPartsModal(false);
  };

  const handleAddPart = async (part) => {
    if (addingPart || !repair) return;

    setAddingPart(true);
    try {
      const { data } = await addRepairPart(repair.repair_id, {
        part_id: part.part_id,
        quantity: 1,
        unit_cost: part.unit_cost
      });

      if (data?.ok) {
        await loadAssignedParts(repair.repair_id);
        setShowPartsModal(false);
      } else {
        alert(data?.error || 'Failed to add part');
      }
    } catch (err) {
      console.error('Failed to add part:', err);
      alert('Failed to add part');
    } finally {
      setAddingPart(false);
    }
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


  if (loading) {
    return (
      <div className="mobile-frame employee-appt-detail-screen">
        <div className="loading-message">Loading appointment...</div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const customerName = `${capitalize(appointment.customer_first_name)} ${capitalize(appointment.customer_last_name).charAt(0)}.`;
  const vehicleDesc = `${appointment.color ? capitalize(appointment.color) + ',' : ''} ${appointment.make || ''}, ${appointment.model || ''}`.trim().replace(/,\s*$/, '');

  return (
    <div className="mobile-frame employee-appt-detail-screen">
      <div className="detail-header">
        <button className="back-link" onClick={() => navigate('/mobile/employee/schedule')}>
          Back
        </button>
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

      <div className="detail-content">
        <h2 className="customer-name">{customerName}</h2>

        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Time:</span>
            <span className="info-value">{appointment.formatted_start_time || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Service:</span>
            <span className="info-value">{appointment.service_name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Vehicle:</span>
            <span className="info-value">{vehicleDesc}</span>
          </div>
          <div className="info-row">
            <span className="info-label">License Plate:</span>
            <span className="info-value">{appointment.plate_number || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">VIN:</span>
            <span className="info-value">{appointment.vin || 'N/A'}</span>
          </div>
        </div>

        <div className="status-section">
          <h3 className="section-title">Current Status</h3>
          <div className="status-buttons">
            <button
              className={`status-btn ${currentStatus === 'in_progress' ? 'active' : ''}`}
              onClick={() => handleStatusChange('in_progress')}
              disabled={updatingStatus}
            >
              In Progress
            </button>
            <button
              className={`status-btn ${currentStatus === 'done' ? 'active' : ''}`}
              onClick={() => handleStatusChange('done')}
              disabled={updatingStatus}
            >
              Done
            </button>
            <button
              className={`status-btn ${currentStatus === 'canceled' ? 'active' : ''}`}
              onClick={() => handleStatusChange('canceled')}
              disabled={updatingStatus}
            >
              Canceled
            </button>
          </div>
        </div>

        <div className="parts-section">
          <h3 className="section-title">Assign Parts</h3>
          <div className="parts-container">
            <button className="add-part-btn" onClick={handleOpenPartsModal}>
              <span className="plus-icon">+</span>
            </button>
            {assignedParts.map((part) => (
              <div key={part.part_id} className="assigned-part">
                {part.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Parts Modal */}
      {showPartsModal && (
        <div className="parts-modal-overlay" onClick={handleClosePartsModal}>
          <div className="parts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="parts-modal-header">
              <button className="back-link" onClick={handleClosePartsModal}>
                Back
              </button>
              <div className="menu-container">
                <button className="hamburger-menu" aria-label="Menu">
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                </button>
              </div>
            </div>

            <h3 className="parts-modal-title">Assign Parts</h3>

            <div className="parts-list">
              {availableParts.map((part) => (
                <div key={part.part_id} className="part-row">
                  <span className="part-name">{part.name}</span>
                  <span className="part-price">${Number(part.unit_cost || 0).toFixed(0)}</span>
                  <button
                    className="add-btn"
                    onClick={() => handleAddPart(part)}
                    disabled={addingPart}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
