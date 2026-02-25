import { useState, useEffect } from 'react';

import { updateStaff, getAvailablePosition } from '../../../api/staff';

function EditStaffModal({ isOpen, onClose, staff, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [availablePositions, setAvailablePositions] = useState([]);

  const [isPositionLoading, setIsPositionLoading] = useState(false);

  const initialFormData = {
    first_name: '',
    middle_initial: '',
    last_name: '',
    contact_number: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const reset = () => {
      setError(null);
      setSaving(false);
      setAvailablePositions([]);
      setIsPositionLoading(false);
      setFormData({
        first_name: '',
        middle_initial: '',
        last_name: '',
        contact_number: '',
      });
      setSelectedPositionId('');
    };

    if (!isOpen) {
      reset();
      return;
    }

    if (isOpen) {
      fetchPositions();
    }
    if (staff) {
      setFormData({
        first_name: staff.first_name || '',
        middle_initial: staff.middle_initial || '',
        last_name: staff.last_name || '',
        contact_number: staff.contact_number || '',
      });
      setSelectedPositionId(staff.position?.position_id || '');
    }
  }, [isOpen, staff]);

  const fetchPositions = async () => {
    setIsPositionLoading(true);
    setError(null);

    try {
      const result = await getAvailablePosition();

      if (result.success) {
        setAvailablePositions(result.data || []);
      } else {
        setError({
          type: 'GENERAL',
          message: result.message || 'Failed to fetch available positions.',
        });
      }
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
        console.error('Backend error:', errorMessage);
      } else if (error.request) {
        errorMessage = 'No response from server';
        console.error('Network error:', errorMessage);
      } else {
        errorMessage = error.message;
        console.error('Unexpected error:', errorMessage);
      }

      setError({ type: 'GENERAL', message: errorMessage });
    } finally {
      setIsPositionLoading(false);
    }
  };

  const handleSubmitEdit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!selectedPositionId) {
      setError({ type: 'VALIDATION', message: 'Position is required' });
      setSaving(false);
      return;
    }

    try {
      if (!staff?.staff_id) return;

      const sanitized = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      );

      const payload = { ...sanitized, position_id: selectedPositionId };

      const result = await updateStaff(staff.staff_id, payload);
      if (result.success) {
        onUpdated();
        onClose();
      } else {
        setError({ type: 'UPDATE_FAILED', message: result.message || 'Update failed' });
      }
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
        console.error('Backend error:', errorMessage);
      } else if (error.request) {
        errorMessage = 'No response from server';
        console.error('Network error:', errorMessage);
      } else {
        errorMessage = error.message;
        console.error('Unexpected error:', errorMessage);
      }
      setError({ type: 'GENERAL', message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Edit Staff</h2>

        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitEdit}>
          {/* Staff Info */}
          <div className="form-section">
            <h3 className="section-title">Staff Info</h3>
            <label htmlFor="first_name">
              First Name <span className="required">*</span>
            </label>
            <input
              id="first_name"
              type="text"
              placeholder="Enter first name"
              value={formData.first_name || ''}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <label htmlFor="middle_initial">Middle Initial</label>
            <input
              id="middle_initial"
              type="text"
              placeholder="Enter middle initial"
              value={formData.middle_initial || ''}
              onChange={e => setFormData({ ...formData, middle_initial: e.target.value })}
            />
            <label htmlFor="last_name">
              Last Name <span className="required">*</span>
            </label>
            <input
              id="last_name"
              type="text"
              placeholder="Enter last name"
              value={formData.last_name || ''}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
            <label htmlFor="position_id">
              Position <span className="required">*</span>
            </label>
            <select
              id="position_id"
              value={selectedPositionId}
              onChange={e => setSelectedPositionId(e.target.value)}
              disabled={saving || isPositionLoading}
            >
              <option value="">-- Select a Position --</option>
              {availablePositions.map(p => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))}
            </select>

            <label htmlFor="contact_number">
              Contact Number <span className="required">*</span>
            </label>
            <input
              id="contact_number"
              type="text"
              placeholder="e.g., 09123456789"
              value={formData.contact_number || ''}
              onChange={e => {
                const raw = e.target.value;

                // Clear error if user is editing again
                if (error?.type === 'CONTACT_FORMAT') {
                  setError(null);
                }

                if (raw === '') {
                  setFormData({ ...formData, contact_number: '' });
                  return;
                }

                // Allow only digits and optional leading +
                if (!/^\+?[0-9]*$/.test(raw)) return;

                setFormData({ ...formData, contact_number: raw });
              }}
              onBlur={e => {
                let raw = e.target.value.trim();

                if (raw === '') return;

                // Convert 09XXXXXXXXX → +639XXXXXXXXX
                if (raw.startsWith('09')) {
                  raw = '+639' + raw.slice(2);
                }

                // Validate final PH format
                if (!/^\+639\d{9}$/.test(raw)) {
                  setError({
                    type: 'CONTACT_FORMAT',
                    message: 'Invalid Philippine mobile number format',
                  });
                  return;
                }

                setFormData({ ...formData, contact_number: raw });
              }}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStaffModal;
