import React from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffBilling.module.css";

const DUMMY_INVOICES = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    customer: "Jane Doe",
    service: "Oil Change",
    date: "2025-11-28",
    total: "$85.00",
    status: "paid"
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    customer: "John Smith",
    service: "Brake Inspection",
    date: "2025-11-28",
    total: "$125.00",
    status: "pending"
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    customer: "Mike Wilson",
    service: "Tire Rotation",
    date: "2025-11-29",
    total: "$65.00",
    status: "paid"
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-004",
    customer: "Emily Brown",
    service: "Full Service",
    date: "2025-11-29",
    total: "$350.00",
    status: "pending"
  },
  {
    id: 5,
    invoiceNumber: "INV-2025-005",
    customer: "David Lee",
    service: "Engine Diagnostics",
    date: "2025-11-30",
    total: "$180.00",
    status: "paid"
  },
  {
    id: 6,
    invoiceNumber: "INV-2025-006",
    customer: "Sarah Johnson",
    service: "Transmission Service",
    date: "2025-11-30",
    total: "$425.00",
    status: "overdue"
  },
  {
    id: 7,
    invoiceNumber: "INV-2025-007",
    customer: "Robert Taylor",
    service: "Battery Replacement",
    date: "2025-11-30",
    total: "$195.00",
    status: "pending"
  }
];

const DUMMY_PAYMENTS = [
  {
    id: 1,
    transactionNumber: "TXN-20251128-001",
    invoiceNumber: "INV-2025-001",
    method: "Credit Card",
    date: "2025-11-28",
    amount: "$85.00",
    status: "completed"
  },
  {
    id: 2,
    transactionNumber: "TXN-20251129-002",
    invoiceNumber: "INV-2025-003",
    method: "Debit Card",
    date: "2025-11-29",
    amount: "$65.00",
    status: "completed"
  },
  {
    id: 3,
    transactionNumber: "TXN-20251130-003",
    invoiceNumber: "INV-2025-005",
    method: "Cash",
    date: "2025-11-30",
    amount: "$180.00",
    status: "completed"
  },
  {
    id: 4,
    transactionNumber: "TXN-20251130-004",
    invoiceNumber: "INV-2025-002",
    method: "Credit Card",
    date: "2025-11-30",
    amount: "$125.00",
    status: "processing"
  },
  {
    id: 5,
    transactionNumber: "TXN-20251130-005",
    invoiceNumber: "INV-2025-007",
    method: "Digital Wallet",
    date: "2025-11-30",
    amount: "$195.00",
    status: "processing"
  }
];

export default function StaffBilling() {
  const navigate = useNavigate();

  const getInvoiceStatusClass = (status) => {
    switch (status) {
      case "paid": return styles.statusPaid;
      case "pending": return styles.statusPending;
      case "overdue": return styles.statusOverdue;
      default: return "";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "completed": return styles.statusCompleted;
      case "processing": return styles.statusProcessing;
      case "failed": return styles.statusFailed;
      default: return "";
    }
  };

  return (
    <StaffLayout>
      <div className={styles.billingContainer}>
        <button 
          className={styles.backLink}
          onClick={() => navigate("/staff")}
        >
          ← Back to Dashboard
        </button>
        
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Invoices & Payments</h1>
          <p className={styles.subtitle}>Track billing activity</p>
        </div>

        {/* Recent Invoices Section */}
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Invoices</h2>
            <span className={styles.recordCount}>{DUMMY_INVOICES.length} invoices</span>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_INVOICES.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className={styles.invoiceNumber}>{invoice.invoiceNumber}</td>
                    <td className={styles.customerName}>{invoice.customer}</td>
                    <td>{invoice.service}</td>
                    <td>{invoice.date}</td>
                    <td className={styles.amount}>{invoice.total}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getInvoiceStatusClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Payments</h2>
            <span className={styles.recordCount}>{DUMMY_PAYMENTS.length} transactions</span>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Invoice #</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_PAYMENTS.map((payment) => (
                  <tr key={payment.id}>
                    <td className={styles.transactionNumber}>{payment.transactionNumber}</td>
                    <td className={styles.invoiceNumber}>{payment.invoiceNumber}</td>
                    <td>{payment.method}</td>
                    <td>{payment.date}</td>
                    <td className={styles.amount}>{payment.amount}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getPaymentStatusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
