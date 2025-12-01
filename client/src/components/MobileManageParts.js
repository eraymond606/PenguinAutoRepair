import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MobileManageParts.css';
import { getParts, createPart, updatePart, deletePart } from './Api';

export default function MobileManageParts() {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState({
    name: '',
    vendor: '',
    unit_cost: '',
    quantity_in_stock: ''
  });

  const emptyForm = {
    name: '',
    vendor: '',
    unit_cost: '',
    quantity_in_stock: ''
  };

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      const { data } = await getParts();
      if (data?.ok) {
        setParts(data.parts || []);
      }
    } catch (err) {
      console.error('Failed to load parts:', err);
      alert('Could not load parts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingPart(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleEditPart = (part) => {
    setEditingPart(part);
    setForm({
      name: part.name || '',
      vendor: part.vendor || '',
      unit_cost: part.unit_cost ? String(part.unit_cost) : '',
      quantity_in_stock: part.quantity_in_stock ? String(part.quantity_in_stock) : ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPart(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Basic validation
    if (!form.name.trim()) {
      alert('Part name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        vendor: form.vendor.trim() || null,
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : null,
        quantity_in_stock: form.quantity_in_stock ? parseInt(form.quantity_in_stock) : null
      };

      let data;
      if (editingPart) {
        const response = await updatePart(editingPart.part_id, payload);
        data = response.data;
      } else {
        const response = await createPart(payload);
        data = response.data;
      }

      if (data?.ok) {
        handleCloseModal();
        await loadParts();
      } else {
        alert(data?.error || `Failed to ${editingPart ? 'update' : 'create'} part`);
      }
    } catch (err) {
      console.error(`Failed to ${editingPart ? 'update' : 'create'} part:`, err);
      const errorMsg = err.response?.data?.error || `Failed to ${editingPart ? 'update' : 'create'} part`;
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingPart) return;
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!editingPart) return;

    setSubmitting(true);
    try {
      const { data } = await deletePart(editingPart.part_id);
      if (data?.ok) {
        setShowDeleteConfirm(false);
        handleCloseModal();
        await loadParts();
      } else {
        alert(data?.error || 'Failed to delete part');
      }
    } catch (err) {
      console.error('Failed to delete part:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete part';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPartId = (id) => {
    return String(id).padStart(5, '0');
  };

  return (
    <div className="mobile-frame manage-parts-screen">
      <button className="back-link" onClick={() => navigate('/mobile/manager/select')}>Back</button>
      <button className="hamburger-menu" aria-label="Menu">
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <h2 className="manage-parts-title">Manage Parts & Vendors</h2>

      <div className="parts-table">
        <div className="table-header">
          <span className="header-col">ID</span>
          <span className="header-col">Name</span>
          <span className="header-col">Vendor</span>
          <span className="header-col">Cost</span>
          <span className="header-col">Qty</span>
        </div>

        <div className="table-body">
          {loading ? (
            <div className="loading-message">Loading parts...</div>
          ) : parts.length === 0 ? (
            <div className="no-parts">No parts found</div>
          ) : (
            parts.map((part) => (
              <div
                key={part.part_id}
                className="part-row clickable"
                onClick={() => handleEditPart(part)}
              >
                <span className="part-col">{formatPartId(part.part_id)}</span>
                <span className="part-col">{part.name}</span>
                <span className="part-col">{part.vendor || '-'}</span>
                <span className="part-col">{part.unit_cost ? `$${Number(part.unit_cost).toFixed(2)}` : '-'}</span>
                <span className="part-col">{part.quantity_in_stock ?? '-'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="add-new-btn" onClick={handleAddNew}>
        Add New
      </button>

      {/* Add/Edit Part Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Manage Parts</h3>
            <form className="part-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Part Name"
                className="part-input"
              />
              <input
                type="text"
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                placeholder="Vendor"
                className="part-input"
              />
              <input
                type="number"
                name="unit_cost"
                value={form.unit_cost}
                onChange={handleChange}
                placeholder="Unit Cost"
                className="part-input"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                name="quantity_in_stock"
                value={form.quantity_in_stock}
                onChange={handleChange}
                placeholder="Quantity in Stock"
                className="part-input"
                min="0"
              />
              <div className="modal-buttons">
                {editingPart && (
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
      {showDeleteConfirm && editingPart && (
        <div className="delete-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Delete Part</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete {editingPart.name}?
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
