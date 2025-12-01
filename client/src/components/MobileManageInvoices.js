import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageInvoices.css';
import { getInvoices, getInvoiceDetails } from './Api';

export default function MobileManageInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await getInvoices();
      if (data?.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
      alert('Could not load invoices');
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatName = (firstName, lastName) => {
    const first = capitalize(firstName);
    const last = capitalize(lastName);
    return `${first} ${last}`.trim();
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

  const handleInvoiceClick = async (invoice) => {
    setLoadingDetails(true);
    setSelectedInvoice(invoice);
    try {
      const { data } = await getInvoiceDetails(invoice.invoice_id);
      if (data?.ok) {
        setSelectedInvoice(data.invoice);
      }
    } catch (err) {
      console.error('Failed to load invoice details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  return (
    <div className="mobile-frame manage-invoices-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-invoices-title">Manage Invoices</h2>

      <div className="invoices-table">
        <div className="table-header">
          <span className="header-col">Customer</span>
          <span className="header-col">Date</span>
          <span className="header-col">Total</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="no-invoices">No invoices found</div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                className="invoice-row clickable"
                onClick={() => handleInvoiceClick(invoice)}
              >
                <span className="invoice-col">{formatName(invoice.first_name, invoice.last_name)}</span>
                <span className="invoice-col">{formatDate(invoice.invoice_date)}</span>
                <span className="invoice-col">{formatCurrency(invoice.total)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Invoice Details</h3>
            {loadingDetails ? (
              <div className="loading-message">Loading...</div>
            ) : (
              <div className="invoice-details">
                <div className="detail-row">
                  <span className="detail-label">Invoice #:</span>
                  <span className="detail-value">{String(selectedInvoice.invoice_id).padStart(5, '0')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{formatName(selectedInvoice.first_name, selectedInvoice.last_name)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedInvoice.invoice_date)}</span>
                </div>

                <div className="detail-divider"></div>
                <h4 className="items-title">Items</h4>

                {selectedInvoice.service_name && (
                  <div className="line-item">
                    <span className="item-name">{selectedInvoice.service_name}</span>
                    <span className="item-price">
                      {formatCurrency(Number(selectedInvoice.hourly_rate || 0) * Number(selectedInvoice.default_hours || 1))}
                    </span>
                  </div>
                )}

                {selectedInvoice.parts && selectedInvoice.parts.map((part, index) => (
                  <div key={index} className="line-item">
                    <span className="item-name">{part.name} {part.quantity > 1 ? `x${part.quantity}` : ''}</span>
                    <span className="item-price">{formatCurrency(Number(part.unit_cost) * Number(part.quantity))}</span>
                  </div>
                ))}

                <div className="detail-divider"></div>
                <div className="detail-row">
                  <span className="detail-label">Subtotal:</span>
                  <span className="detail-value">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tax (6.5%):</span>
                  <span className="detail-value">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-row total-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            )}
            <button className="close-btn" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
