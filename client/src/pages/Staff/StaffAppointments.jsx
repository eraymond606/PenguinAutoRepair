import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffAppointments.module.css";

const INITIAL_APPOINTMENTS = [
  {
    id: 1,
    date: "2025-09-18",
    time: "09:30 AM",
    customer: "Jane Doe",
    vehicle: "2018 Honda Accord",
    service: "Oil Change",
    technician: "Alex Smith",
    status: "scheduled"
  },
  {
    id: 2,
    date: "2025-09-18",
    time: "11:00 AM",
    customer: "John Smith",
    vehicle: "2020 Toyota Camry",
    service: "Brake Inspection",
    technician: "Sarah Johnson",
    status: "scheduled"
  },
  {
    id: 3,
    date: "2025-09-19",
    time: "10:00 AM",
    customer: "Mike Wilson",
    vehicle: "2019 Ford F-150",
    service: "Tire Rotation",
    technician: "Alex Smith",
    status: "in_progress"
  },
  {
    id: 4,
    date: "2025-09-19",
    time: "02:30 PM",
    customer: "Emily Brown",
    vehicle: "2021 Nissan Altima",
    service: "Full Service",
    technician: "Sarah Johnson",
    status: "scheduled"
  },
  {
    id: 5,
    date: "2025-09-20",
    time: "09:00 AM",
    customer: "David Lee",
    vehicle: "2017 Chevrolet Malibu",
    service: "Engine Diagnostics",
    technician: "Alex Smith",
    status: "completed"
  }
];

const TECHNICIANS = ["Alex Smith", "Sarah Johnson", "Mike Davis", "Jessica Martinez"];
const STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" }
];

export default function StaffAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedId, setSelectedId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const selectedAppointment = appointments.find(a => a.id === selectedId);

  const handleSelectAppointment = (appointment) => {
    setSelectedId(appointment.id);
    setEditForm({ ...appointment });
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = appointments.map(a => 
      a.id === selectedId ? { ...editForm } : a
    );
    setAppointments(updated);
    alert("Appointment updated successfully!");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled": return styles.statusScheduled;
      case "in_progress": return styles.statusInProgress;
      case "completed": return styles.statusCompleted;
      default: return "";
    }
  };

  return (
    <StaffLayout>
      <div className={styles.staffContainer}>
        <button 
          className={styles.backLink}
          onClick={() => navigate("/staff")}
        >
          ← Back to Dashboard
        </button>
        <h1 className={styles.pageTitle}>Manage Appointments</h1>
        
        <div className={styles.contentBox}>
          <div className={styles.appointmentsList}>
            <h2 className={styles.sectionTitle}>Appointments</h2>
            
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`${styles.appointmentRow} ${selectedId === appointment.id ? styles.selected : ''}`}
                onClick={() => handleSelectAppointment(appointment)}
              >
                <div className={styles.appointmentHeader}>
                  <span className={styles.appointmentDate}>{appointment.date}</span>
                  <span className={styles.appointmentTime}>{appointment.time}</span>
                </div>
                <div className={styles.appointmentCustomer}>{appointment.customer}</div>
                <div className={styles.appointmentVehicle}>{appointment.vehicle}</div>
                <div className={styles.appointmentService}>{appointment.service}</div>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          
          <div className={styles.detailsPanel}>
            {selectedAppointment ? (
              <>
                <h2 className={styles.sectionTitle}>Appointment Details</h2>
                
                <form onSubmit={handleSave}>
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Customer</label>
                    <div className={styles.readOnlyField}>{editForm.customer}</div>
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Vehicle</label>
                    <div className={styles.readOnlyField}>{editForm.vehicle}</div>
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Service</label>
                    <div className={styles.readOnlyField}>{editForm.service}</div>
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Time</label>
                    <input
                      type="text"
                      name="time"
                      value={editForm.time}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="e.g., 09:30 AM"
                    />
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Technician</label>
                    <select
                      name="technician"
                      value={editForm.technician}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      {TECHNICIANS.map(tech => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.panelSection}>
                    <label className={styles.label}>Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button type="submit" className={styles.btnPrimary}>
                    Save Changes
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>Select an appointment to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
