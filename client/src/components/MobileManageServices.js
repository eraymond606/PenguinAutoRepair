import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageServices.css';
import { getServices, createService, updateService, deleteService } from './Api';

export default function MobileManageServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    hourly_rate: '',
    default_hours: ''
  });

  const emptyForm = {
    name: '',
    description: '',
    hourly_rate: '',
    default_hours: ''
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data } = await getServices();
      if (data?.ok) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      alert('Could not load services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      hourly_rate: service.hourly_rate ? String(service.hourly_rate) : '',
      default_hours: service.default_hours ? String(service.default_hours) : ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim()) {
      alert('Service name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        default_hours: form.default_hours ? parseFloat(form.default_hours) : null
      };

      let data;
      if (editingService) {
        const response = await updateService(editingService.service_id, payload);
        data = response.data;
      } else {
        const response = await createService(payload);
        data = response.data;
      }

      if (data?.ok) {
        handleCloseModal();
        await loadServices();
      } else {
        alert(data?.error || `Failed to ${editingService ? 'update' : 'create'} service`);
      }
    } catch (err) {
      console.error(`Failed to ${editingService ? 'update' : 'create'} service:`, err);
      const errorMsg = err.response?.data?.error || `Failed to ${editingService ? 'update' : 'create'} service`;
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingService) return;
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!editingService) return;

    setSubmitting(true);
    try {
      const { data } = await deleteService(editingService.service_id);
      if (data?.ok) {
        setShowDeleteConfirm(false);
        handleCloseModal();
        await loadServices();
      } else {
        alert(data?.error || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete service';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatServiceId = (id) => {
    return String(id).padStart(5, '0');
  };

  return (
    <div className="mobile-frame manage-services-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-services-title">Manage Services</h2>

      <div className="services-table">
        <div className="table-header">
          <span className="header-col">ID</span>
          <span className="header-col">Name</span>
          <span className="header-col">Rate</span>
          <span className="header-col">Hours</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="no-services">No services found</div>
          ) : (
            services.map((service) => (
              <div
                key={service.service_id}
                className="service-row clickable"
                onClick={() => handleEditService(service)}
              >
                <span className="service-col">{formatServiceId(service.service_id)}</span>
                <span className="service-col">{service.name}</span>
                <span className="service-col">{service.hourly_rate ? `$${Number(service.hourly_rate).toFixed(2)}` : '-'}</span>
                <span className="service-col">{service.default_hours ?? '-'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="add-new-btn" onClick={handleAddNew}>
        Add New
      </button>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Manage Services</h3>
            <form className="service-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Service Name"
                className="service-input"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="service-input service-textarea"
                rows="3"
              />
              <input
                type="number"
                name="hourly_rate"
                value={form.hourly_rate}
                onChange={handleChange}
                placeholder="Hourly Rate"
                className="service-input"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                name="default_hours"
                value={form.default_hours}
                onChange={handleChange}
                placeholder="Default Hours"
                className="service-input"
                step="0.5"
                min="0"
              />
              <div className="modal-buttons">
                {editingService && (
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
      {showDeleteConfirm && editingService && (
        <div className="delete-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Delete Service</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete {editingService.name}?
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
