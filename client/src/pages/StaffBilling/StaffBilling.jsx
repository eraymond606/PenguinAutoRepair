import React from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import styles from "./StaffBilling.module.css";

const DUMMY_INVOICES = [
  {
    id: "INV-2025-001",
    customerName: "Jane Doe",
    serviceName: "Oil Change",
    date: "2025-11-28",
    subtotal: 75.00,
    tax: 6.00,
    total: 81.00,
    status: "paid"
  },
  {
    id: "INV-2025-002",
    customerName: "John Smith",
    serviceName: "Brake Inspection",
    date: "2025-11-28",
    subtotal: 110.00,
    tax: 8.80,
    total: 118.80,
    status: "pending"
  },
  {
    id: "INV-2025-003",
    customerName: "Mike Wilson",
    serviceName: "Tire Rotation",
    date: "2025-11-29",
    subtotal: 60.00,
    tax: 4.80,
    total: 64.80,
    status: "paid"
  },
  {
    id: "INV-2025-004",
    customerName: "Emily Brown",
    serviceName: "Full Service",
    date: "2025-11-29",
    subtotal: 320.00,
    tax: 25.60,
    total: 345.60,
    status: "pending"
  },
  {
    id: "INV-2025-005",
    customerName: "David Lee",
    serviceName: "Engine Diagnostics",
    date: "2025-11-30",
    subtotal: 165.00,
    tax: 13.20,
    total: 178.20,
    status: "paid"
  },
  {
    id: "INV-2025-006",
    customerName: "Sarah Johnson",
    serviceName: "Transmission Service",
    date: "2025-11-30",
    subtotal: 390.00,
    tax: 31.20,
    total: 421.20,
    status: "overdue"
  },
  {
    id: "INV-2025-007",
    customerName: "Robert Taylor",
    serviceName: "Battery Replacement",
    date: "2025-11-30",
    subtotal: 180.00,
    tax: 14.40,
    total: 194.40,
    status: "pending"
  },
  {
    id: "INV-2025-008",
    customerName: "Lisa Anderson",
    serviceName: "AC Service",
    date: "2025-11-25",
    subtotal: 145.00,
    tax: 11.60,
    total: 156.60,
    status: "paid"
  },
  {
    id: "INV-2025-009",
    customerName: "Maria Rodriguez",
    serviceName: "Wheel Alignment",
    date: "2025-11-26",
    subtotal: 85.00,
    tax: 6.80,
    total: 91.80,
    status: "paid"
  }
];

const DUMMY_TRANSACTIONS = [
  {
    transactionId: "TXN-20251128-001",
    invoiceId: "INV-2025-001",
    customerName: "Jane Doe",
    amount: 81.00,
    method: "Credit Card",
    routingNumber: "****-****-****-1234",
    date: "2025-11-28",
    status: "completed"
  },
  {
    transactionId: "TXN-20251129-002",
    invoiceId: "INV-2025-003",
    customerName: "Mike Wilson",
    amount: 64.80,
    method: "Debit Card",
    routingNumber: "****-****-****-5678",
    date: "2025-11-29",
    status: "completed"
  },
  {
    transactionId: "TXN-20251130-003",
    invoiceId: "INV-2025-005",
    customerName: "David Lee",
    amount: 178.20,
    method: "Cash",
    routingNumber: "N/A",
    date: "2025-11-30",
    status: "completed"
  },
  {
    transactionId: "TXN-20251130-004",
    invoiceId: "INV-2025-002",
    customerName: "John Smith",
    amount: 118.80,
    method: "Credit Card",
    routingNumber: "****-****-****-9012",
    date: "2025-11-30",
    status: "processing"
  },
  {
    transactionId: "TXN-20251130-005",
    invoiceId: "INV-2025-007",
    customerName: "Robert Taylor",
    amount: 194.40,
    method: "Digital Wallet",
    routingNumber: "paypal@email.com",
    date: "2025-11-30",
    status: "processing"
  },
  {
    transactionId: "TXN-20251125-006",
    invoiceId: "INV-2025-008",
    customerName: "Lisa Anderson",
    amount: 156.60,
    method: "Check",
    routingNumber: "021000021",
    date: "2025-11-25",
    status: "completed"
  },
  {
    transactionId: "TXN-20251126-007",
    invoiceId: "INV-2025-009",
    customerName: "Maria Rodriguez",
    amount: 91.80,
    method: "Credit Card",
    routingNumber: "****-****-****-3456",
    date: "2025-11-26",
    status: "completed"
  }
];

export default function StaffBilling() {
  const navigate = useNavigate();

  // Calculate summary metrics
  const todayRevenue = DUMMY_TRANSACTIONS
    .filter(t => t.date === "2025-11-30" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const weekRevenue = DUMMY_TRANSACTIONS
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const unpaidCount = DUMMY_INVOICES.filter(
    inv => inv.status === "pending" || inv.status === "overdue"
  ).length;

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

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>${todayRevenue.toFixed(2)}</div>
            <div className={styles.summaryLabel}>Today's Revenue</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>${weekRevenue.toFixed(2)}</div>
            <div className={styles.summaryLabel}>This Week's Revenue</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{unpaidCount}</div>
            <div className={styles.summaryLabel}>Unpaid Invoices</div>
          </div>
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
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_INVOICES.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className={styles.invoiceNumber}>{invoice.id}</td>
                    <td className={styles.customerName}>{invoice.customerName}</td>
                    <td>{invoice.serviceName}</td>
                    <td>{invoice.date}</td>
                    <td className={styles.amount}>${invoice.subtotal.toFixed(2)}</td>
                    <td className={styles.taxAmount}>${invoice.tax.toFixed(2)}</td>
                    <td className={styles.totalAmount}>${invoice.total.toFixed(2)}</td>
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

        {/* Recent Transactions Section */}
        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <span className={styles.recordCount}>{DUMMY_TRANSACTIONS.length} transactions</span>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Routing Number</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_TRANSACTIONS.map((transaction) => (
                  <tr key={transaction.transactionId}>
                    <td className={styles.transactionNumber}>{transaction.transactionId}</td>
                    <td className={styles.invoiceNumber}>{transaction.invoiceId}</td>
                    <td className={styles.customerName}>{transaction.customerName}</td>
                    <td className={styles.totalAmount}>${transaction.amount.toFixed(2)}</td>
                    <td>{transaction.method}</td>
                    <td className={styles.routingNumber}>{transaction.routingNumber}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getPaymentStatusClass(transaction.status)}`}>
                        {transaction.status}
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
