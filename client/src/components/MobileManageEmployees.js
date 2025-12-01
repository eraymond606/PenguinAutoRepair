import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageEmployees.css';
import { getTechnicians, createTechnician, updateTechnician, deleteTechnician } from './Api';

export default function MobileManageEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    hourly_wage: ''
  });

  const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    hourly_wage: ''
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getTechnicians();
      if (data?.ok) {
        setEmployees(data.technicians || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      alert('Could not load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      hourly_wage: emp.hourly_wage ? String(emp.hourly_wage) : ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Basic validation
    if (!form.first_name.trim() || !form.last_name.trim()) {
      alert('First name and last name are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        position: form.position || null,
        hourly_wage: form.hourly_wage ? parseFloat(form.hourly_wage) : null
      };

      let data;
      if (editingEmployee) {
        // Update existing employee
        const response = await updateTechnician(editingEmployee.technician_id, payload);
        data = response.data;
      } else {
        // Create new employee
        const response = await createTechnician(payload);
        data = response.data;
      }

      if (data?.ok) {
        handleCloseModal();
        await loadEmployees();
      } else {
        alert(data?.error || `Failed to ${editingEmployee ? 'update' : 'create'} employee`);
      }
    } catch (err) {
      console.error(`Failed to ${editingEmployee ? 'update' : 'create'} employee:`, err);
      const errorMsg = err.response?.data?.error || `Failed to ${editingEmployee ? 'update' : 'create'} employee`;
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingEmployee) return;
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!editingEmployee) return;

    setSubmitting(true);
    try {
      const { data } = await deleteTechnician(editingEmployee.technician_id);
      if (data?.ok) {
        setShowDeleteConfirm(false);
        handleCloseModal();
        await loadEmployees();
      } else {
        alert(data?.error || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Failed to delete employee:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete employee';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatEmpNumber = (id) => {
    return String(id).padStart(5, '0');
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatName = (firstName, lastName) => {
    return `${capitalize(firstName)} ${capitalize(lastName).charAt(0)}.`;
  };

  return (
    <div className="mobile-frame manage-employees-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-employees-title">Manage Employees</h2>

      <div className="employees-table">
        <div className="table-header">
          <span className="header-emp-number">Emp. Number</span>
          <span className="header-name">Name</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="no-employees">No employees found</div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.technician_id}
                className="employee-row clickable"
                onClick={() => handleEditEmployee(emp)}
              >
                <span className="emp-number">{formatEmpNumber(emp.technician_id)}</span>
                <span className="emp-name">{formatName(emp.first_name, emp.last_name)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="add-new-btn" onClick={handleAddNew}>
        Add New
      </button>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Manage Employees</h3>
            <form className="employee-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="employee-input"
              />
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="employee-input"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="employee-input"
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="employee-input"
              />
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className="employee-input employee-select"
              >
                <option value="">Select Position</option>
                <option value="Technician">Technician</option>
                <option value="Snr Technician">Snr Technician</option>
                <option value="Tech Intern">Tech Intern</option>
                <option value="Manager">Manager</option>
              </select>
              <input
                type="number"
                name="hourly_wage"
                value={form.hourly_wage}
                onChange={handleChange}
                placeholder="Hourly Wage"
                className="employee-input"
                step="0.01"
                min="0"
              />
              <div className="modal-buttons">
                {editingEmployee && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleDeleteClick}
                    disabled={submitting}
                  >
                    🗑 Delete
                  </button>
                )}
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && editingEmployee && (
        <div className="delete-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Delete Employee</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete {capitalize(editingEmployee.first_name)} {capitalize(editingEmployee.last_name)}?
              Once completed, this action cannot be reversed.
            </p>
            <div className="delete-modal-buttons">
              <button
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
