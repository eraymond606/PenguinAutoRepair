import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffInventory.module.css";

const DUMMY_PARTS = [
  {
    id: 1,
    name: "Oil Filter",
    vendor: "ACDelco",
    unitCost: 12.99,
    quantityInStock: 45
  },
  {
    id: 2,
    name: "Air Filter",
    vendor: "K&N",
    unitCost: 24.50,
    quantityInStock: 32
  },
  {
    id: 3,
    name: "Brake Pads (Front)",
    vendor: "Brembo",
    unitCost: 89.99,
    quantityInStock: 18
  },
  {
    id: 4,
    name: "Brake Pads (Rear)",
    vendor: "Brembo",
    unitCost: 79.99,
    quantityInStock: 22
  },
  {
    id: 5,
    name: "Spark Plugs (Set of 4)",
    vendor: "NGK",
    unitCost: 32.00,
    quantityInStock: 28
  },
  {
    id: 6,
    name: "Wiper Blades",
    vendor: "Bosch",
    unitCost: 18.75,
    quantityInStock: 56
  },
  {
    id: 7,
    name: "Battery",
    vendor: "Interstate",
    unitCost: 145.00,
    quantityInStock: 12
  },
  {
    id: 8,
    name: "Transmission Fluid (1qt)",
    vendor: "Valvoline",
    unitCost: 8.50,
    quantityInStock: 64
  }
];

const DUMMY_SERVICES = [
  {
    id: 1,
    name: "Oil Change",
    hourlyRate: 85.00,
    defaultHours: 0.5
  },
  {
    id: 2,
    name: "Brake Inspection",
    hourlyRate: 85.00,
    defaultHours: 1.0
  },
  {
    id: 3,
    name: "Brake Replacement",
    hourlyRate: 95.00,
    defaultHours: 2.5
  },
  {
    id: 4,
    name: "Tire Rotation",
    hourlyRate: 75.00,
    defaultHours: 0.75
  },
  {
    id: 5,
    name: "Engine Diagnostics",
    hourlyRate: 105.00,
    defaultHours: 1.5
  },
  {
    id: 6,
    name: "Transmission Service",
    hourlyRate: 110.00,
    defaultHours: 3.0
  },
  {
    id: 7,
    name: "Air Conditioning Service",
    hourlyRate: 95.00,
    defaultHours: 1.5
  },
  {
    id: 8,
    name: "Battery Replacement",
    hourlyRate: 75.00,
    defaultHours: 0.5
  },
  {
    id: 9,
    name: "Wheel Alignment",
    hourlyRate: 90.00,
    defaultHours: 1.0
  }
];

export default function StaffInventory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("parts");

  return (
    <StaffLayout>
      <div className={styles.inventoryContainer}>
        <button 
          className={styles.backLink}
          onClick={() => navigate("/staff")}
        >
          ← Back to Dashboard
        </button>
        
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Parts & Services</h1>
          <p className={styles.subtitle}>Manage common repair items</p>
        </div>

        <div className={styles.contentCard}>
          {/* Tab Bar */}
          <div className={styles.tabBar}>
            <button
              className={`${styles.tab} ${activeTab === "parts" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("parts")}
            >
              Parts
            </button>
            <button
              className={`${styles.tab} ${activeTab === "services" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("services")}
            >
              Services
            </button>
          </div>

          {/* Content Area */}
          <div className={styles.tabContent}>
            {activeTab === "parts" ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>Vendor</th>
                      <th>Unit Cost</th>
                      <th>Quantity In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUMMY_PARTS.map((part) => (
                      <tr key={part.id}>
                        <td className={styles.itemName}>{part.name}</td>
                        <td>{part.vendor}</td>
                        <td className={styles.costCell}>${part.unitCost.toFixed(2)}</td>
                        <td>
                          <span className={part.quantityInStock < 20 ? styles.stockLow : styles.stockNormal}>
                            {part.quantityInStock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Hourly Rate</th>
                      <th>Default Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUMMY_SERVICES.map((service) => (
                      <tr key={service.id}>
                        <td className={styles.itemName}>{service.name}</td>
                        <td className={styles.rateCell}>${service.hourlyRate.toFixed(2)}/hr</td>
                        <td>{service.defaultHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
