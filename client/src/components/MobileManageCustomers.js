import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageCustomers.css';
import { getCustomers, updateCustomer } from './Api';

export default function MobileManageCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const emptyForm = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await getCustomers();
      if (data?.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      alert('Could not load customers');
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
    const lastInitial = lastName ? capitalize(lastName).charAt(0) + '.' : '';
    return `${first} ${lastInitial}`.trim();
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      street: customer.street || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !editingCustomer) return;

    if (!form.first_name.trim() || !form.last_name.trim()) {
      alert('First name and last name are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        street: form.street.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        zip: form.zip.trim() || null
      };

      const { data } = await updateCustomer(editingCustomer.customer_id, payload);

      if (data?.ok) {
        handleCloseModal();
        await loadCustomers();
      } else {
        alert(data?.error || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Failed to update customer:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update customer';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-frame manage-customers-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-customers-title">Manage Customers</h2>

      <div className="customers-table">
        <div className="table-header">
          <span className="header-col">Name</span>
          <span className="header-col">Phone</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="no-customers">No customers found</div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.customer_id}
                className="customer-row clickable"
                onClick={() => handleEditCustomer(customer)}
              >
                <span className="customer-col">{formatName(customer.first_name, customer.last_name)}</span>
                <span className="customer-col">{formatPhone(customer.phone)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showModal && editingCustomer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Customer</h3>
            <form className="customer-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="customer-input"
              />
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="customer-input"
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="customer-input"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="customer-input"
              />
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="customer-input"
              />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="customer-input"
              />
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="customer-input"
              />
              <input
                type="text"
                name="zip"
                value={form.zip}
                onChange={handleChange}
                placeholder="Zip Code"
                className="customer-input"
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
