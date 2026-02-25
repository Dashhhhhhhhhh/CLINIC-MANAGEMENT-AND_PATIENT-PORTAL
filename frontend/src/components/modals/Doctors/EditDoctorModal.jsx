import { useState, useEffect } from 'react';

import { getAvailableSpecializations, updateDoctor } from '../../../api/doctors';

function EditDoctorModal({ isOpen, onClose, doctor, onUpdated }) {
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState('');

  const [isSpecializationLoading, setIsSpecializationLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      setAvailableSpecializations([]);
      setIsSpecializationLoading(false);
      setFormData({
        first_name: '',
        middle_initial: '',
        last_name: '',
        contact_number: '',
      });
      setSelectedSpecializationId('');
    };

    if (!isOpen) {
      reset();
      return;
    }

    if (isOpen) {
      fetchSpecialization();
    }

    if (doctor) {
      setFormData({
        first_name: doctor.first_name || '',
        middle_initial: doctor.middle_initial || '',
        last_name: doctor.last_name || '',
        contact_number: doctor.contact_number || '',
      });
      setSelectedSpecializationId(doctor.specialization?.specialization_id || '');
    }
  }, [isOpen, doctor]);

  const fetchSpecialization = async () => {
    setIsSpecializationLoading(true);
    setError(null);

    try {
      const result = await getAvailableSpecializations();

      if (result.success) {
        setAvailableSpecializations(result.data || []);
      } else {
        setError({
          type: 'GENERAL',
          message: result.message || 'Failed to fetch available specializations.',
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
      setIsSpecializationLoading(false);
    }
  };

  const handleSubmitEdit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!selectedSpecializationId) {
      setError({ type: 'VALIDATION', message: 'Specialization is required' });
      setSaving(false);
      return;
    }

    try {
      if (!doctor?.doctor_id) return;

      const sanitized = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      );

      const payload = { ...sanitized, specialization_id: selectedSpecializationId };

      const result = await updateDoctor(doctor.doctor_id, payload);

      if (result.success) {
        onUpdated(result.data);
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
        <h2>Edit Doctor's Profile</h2>

        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitEdit}>
          {/* Doctor Info */}
          <div className="form-section">
            <h3 className="section-title">Doctor Info</h3>
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
            <label htmlFor="specialization_id">
              Specialization <span className="required">*</span>
            </label>
            <select
              id="specialization_id"
              value={selectedSpecializationId}
              onChange={e => setSelectedSpecializationId(e.target.value)}
              disabled={saving || isSpecializationLoading}
            >
              <option value="">-- Select a Specialization --</option>
              {availableSpecializations.map(s => (
                <option key={s.specialization_id} value={s.specialization_id}>
                  {s.specialization_name}
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

export default EditDoctorModal;
