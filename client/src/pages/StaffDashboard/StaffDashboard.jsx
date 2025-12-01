import React from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffDashboard.module.css";

const SUMMARY_STATS = [
  { label: "Total Appointments Today", value: "5", color: "#0f4c81" },
  { label: "In Progress", value: "1", color: "#f59e0b" },
  { label: "Completed", value: "1", color: "#10b981" },
  { label: "Estimated Revenue", value: "$3,240", color: "#6366f1" }
];

const TODAY_APPOINTMENTS = [
  {
    id: 1,
    time: "09:00 AM",
    customer: "Jane Doe",
    vehicle: "2018 Honda Accord",
    service: "Oil Change",
    technician: "Alex Smith",
    status: "completed"
  },
  {
    id: 2,
    time: "10:30 AM",
    customer: "John Smith",
    vehicle: "2020 Toyota Camry",
    service: "Brake Inspection",
    technician: "Sarah Johnson",
    status: "in_progress"
  },
  {
    id: 3,
    time: "11:00 AM",
    customer: "Mike Wilson",
    vehicle: "2019 Ford F-150",
    service: "Tire Rotation",
    technician: "Alex Smith",
    status: "scheduled"
  },
  {
    id: 4,
    time: "01:30 PM",
    customer: "Emily Brown",
    vehicle: "2021 Nissan Altima",
    service: "Full Service",
    technician: "Sarah Johnson",
    status: "scheduled"
  },
  {
    id: 5,
    time: "03:00 PM",
    customer: "David Lee",
    vehicle: "2017 Chevrolet Malibu",
    service: "Engine Diagnostics",
    technician: "Mike Davis",
    status: "scheduled"
  }
];

const QUICK_ACTIONS = [
  {
    label: "Manage Appointments",
    path: "/staff/appointments",
    icon: "📅"
  },
  {
    label: "Manage Parts & Services",
    path: "/staff/inventory",
    icon: "🔧"
  },
  {
    label: "View Invoices & Payments",
    path: "/staff/billing",
    icon: "💰"
  },
  {
    label: "Customers & Vehicles",
    path: "/staff/customers",
    icon: "👥"
  },
  {
    label: "Manage Employees",
    path: "/staff/employees",
    icon: "👔"
  }
];

export default function StaffDashboard() {
  const navigate = useNavigate();

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
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Staff Dashboard</h1>
          <p className={styles.subtitle}>Overview of today's work</p>
        </div>

        {/* Summary Cards Grid */}
        <div className={styles.summaryGrid}>
          {SUMMARY_STATS.map((stat, index) => (
            <div key={index} className={styles.summaryCard}>
              <div className={styles.cardValue} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className={styles.cardLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className={styles.contentGrid}>
          {/* Left: Today's Appointments */}
          <div className={styles.appointmentsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Today's Appointments</h2>
              <button 
                className={styles.viewAllBtn}
                onClick={() => navigate("/staff/appointments")}
              >
                View All →
              </button>
            </div>

            <div className={styles.appointmentsList}>
              {TODAY_APPOINTMENTS.map((appointment) => (
                <div
                  key={appointment.id}
                  className={styles.appointmentRow}
                  onClick={() => navigate("/staff/appointments")}
                >
                  <div className={styles.appointmentTime}>{appointment.time}</div>
                  <div className={styles.appointmentDetails}>
                    <div className={styles.appointmentCustomer}>
                      {appointment.customer}
                    </div>
                    <div className={styles.appointmentInfo}>
                      {appointment.vehicle} • {appointment.service}
                    </div>
                    <div className={styles.appointmentTech}>
                      Technician: {appointment.technician}
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(appointment.status)}`}>
                    {appointment.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className={styles.quickActionsSection}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            
            <div className={styles.actionsList}>
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={index}
                  className={styles.actionButton}
                  onClick={() => navigate(action.path)}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <span className={styles.actionArrow}>→</span>
                </button>
              ))}
            </div>

            {/* Additional Info Box */}
            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>Today's Summary</h3>
              <ul className={styles.infoList}>
                <li>5 technicians on duty</li>
                <li>3 urgent repairs pending</li>
                <li>2 customers waiting for updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
