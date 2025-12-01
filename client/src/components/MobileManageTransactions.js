import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageTransactions.css';
import { getTransactions, createTransaction, updateTransaction, getInvoices } from './Api';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function MobileManageTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form, setForm] = useState({
    invoice_id: '',
    amount: '',
    method: '',
    transaction_number: '',
    status: ''
  });

  const emptyForm = {
    invoice_id: '',
    amount: '',
    method: '',
    transaction_number: '',
    status: ''
  };

  const methodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'ach', label: 'ACH' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    loadTransactions();
    loadInvoices();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await getTransactions();
      if (data?.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      alert('Could not load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const { data } = await getInvoices();
      if (data?.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setForm({
      invoice_id: transaction.invoice_id ? String(transaction.invoice_id) : '',
      amount: transaction.amount ? String(transaction.amount) : '',
      method: transaction.method || '',
      transaction_number: transaction.transaction_number || '',
      status: transaction.status || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.invoice_id) {
      alert('Please select an invoice');
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoice_id: parseInt(form.invoice_id),
        amount: parseFloat(form.amount),
        method: form.method || null,
        transaction_number: form.transaction_number.trim() || null,
        status: form.status || 'pending'
      };

      let data;
      if (editingTransaction) {
        const response = await updateTransaction(editingTransaction.transaction_id, payload);
        data = response.data;
      } else {
        const response = await createTransaction(payload);
        data = response.data;
      }

      if (data?.ok) {
        handleCloseModal();
        await loadTransactions();
      } else {
        alert(data?.error || `Failed to ${editingTransaction ? 'update' : 'create'} transaction`);
      }
    } catch (err) {
      console.error(`Failed to ${editingTransaction ? 'update' : 'create'} transaction:`, err);
      const errorMsg = err.response?.data?.error || `Failed to ${editingTransaction ? 'update' : 'create'} transaction`;
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatCustomerName = (firstName, lastName) => {
    const first = capitalize(firstName);
    const last = capitalize(lastName);
    return `${first} ${last}`.trim() || '-';
  };

  return (
    <div className="mobile-frame manage-transactions-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-transactions-title">View Transactions</h2>

      <div className="transactions-table">
        <div className="table-header">
          <span className="header-col">Date</span>
          <span className="header-col">Customer</span>
          <span className="header-col">Amount</span>
          <span className="header-col">Status</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">No transactions found</div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.transaction_id}
                className="transaction-row clickable"
                onClick={() => handleEditTransaction(transaction)}
              >
                <span className="transaction-col">{formatDate(transaction.transaction_date)}</span>
                <span className="transaction-col">{formatCustomerName(transaction.first_name, transaction.last_name)}</span>
                <span className="transaction-col">{formatCurrency(transaction.amount)}</span>
                <span className="transaction-col">{transaction.status ? capitalize(transaction.status) : '-'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="add-new-btn" onClick={handleAddNew}>
        Add New
      </button>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
            <form className="transaction-form" onSubmit={handleSubmit}>
              <select
                name="invoice_id"
                value={form.invoice_id}
                onChange={handleChange}
                className="transaction-input transaction-select"
              >
                <option value="">Select Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.invoice_id} value={inv.invoice_id}>
                    #{String(inv.invoice_id).padStart(5, '0')} - {capitalize(inv.first_name)} {capitalize(inv.last_name)} - {formatCurrency(inv.total)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="transaction-input"
                step="0.01"
                min="0"
              />
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="transaction-input transaction-select"
              >
                <option value="">Select Payment Method</option>
                {methodOptions.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="transaction_number"
                value={form.transaction_number}
                onChange={handleChange}
                placeholder="Transaction Number (optional)"
                className="transaction-input"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="transaction-input transaction-select"
              >
                <option value="">Select Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
