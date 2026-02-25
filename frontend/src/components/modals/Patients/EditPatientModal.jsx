import { useState, useEffect } from 'react';

import { updatePatient } from '../../../api/patients';

function EditPatientModal({ isOpen, onClose, patient, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const initialFormData = {
    first_name: '',
    middle_initial: '',
    last_name: '',
    contact_number: '',
    birthdate: '',
    medical_history: '',
    conditions: '',
    building_number: '',
    street_name: '',
    barangay_subdivision: '',
    city_municipality: '',
    province: '',
    postal_code: '',
    country: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData); // 👈 reset to clean shape
      setSaving(false);
      setError(null);
      return;
    }

    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        middle_initial: patient.middle_initial || '',
        last_name: patient.last_name || '',
        birthdate: patient.birthdate
          ? patient.birthdate.includes('T')
            ? patient.birthdate.split('T')[0]
            : patient.birthdate
          : '',
        medical_history: patient.medical_history || '',
        conditions: Array.isArray(patient.conditions)
          ? patient.conditions.join(', ')
          : patient.conditions || '',
        building_number: patient.building_number || '',
        street_name: patient.street_name || '',
        barangay_subdivision: patient.barangay_subdivision || '',
        city_municipality: patient.city_municipality || '',
        province: patient.province || '',
        postal_code: patient.postal_code || '',
        country: patient.country || '',
      });
    }
  }, [isOpen, patient]);

  const handleSubmitEdit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!patient?.patient_id) return;

      const sanitized = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      );

      const result = await updatePatient(patient.patient_id, sanitized);
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
      className="modal-overlay"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Edit Patient</h2>
        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmitEdit}>
          {/* Patient Info */}
          <div className="form-section">
            <h3 className="section-title">Patient Info</h3>

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

            <label htmlFor="birthdate">
              Birthdate <span className="required">*</span>
            </label>
            <input
              id="birthdate"
              type="date"
              value={formData.birthdate || ''}
              onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
              required
            />

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

          {/* Medical Info */}
          <div className="form-section">
            <h3 className="section-title">Medical</h3>

            <label htmlFor="medical_history">Medical History</label>
            <textarea
              id="medical_history"
              maxLength={1000}
              rows={5}
              placeholder="Enter patient's medical history (max 1000 characters)..."
              value={formData.medical_history || ''}
              onChange={e => setFormData({ ...formData, medical_history: e.target.value })}
            />

            <label htmlFor="conditions">Conditions</label>
            <textarea
              id="conditions"
              placeholder="e.g. Asthma, Diabetes, Allergies"
              value={formData.conditions || ''}
              onChange={e => setFormData({ ...formData, conditions: e.target.value })}
            />
          </div>

          {/* Address */}
          <div className="form-section">
            <h3 className="section-title">Address</h3>

            <label htmlFor="building_number">Building Number</label>
            <input
              id="building_number"
              type="text"
              placeholder="Must be AlphaNumeric only"
              value={formData.building_number || ''}
              onChange={e => {
                const value = e.target.value.trim();

                if (value === '') {
                  setFormData({ ...formData, building_number: '' });
                  return;
                }

                // Only allow alphanumeric
                if (!/^[A-Za-z0-9]+$/.test(value)) return;

                setFormData({ ...formData, building_number: value });
              }}
            />

            <label htmlFor="street_name">Street Name</label>
            <input
              id="street_name"
              type="text"
              placeholder="Enter Street Name"
              value={formData.street_name || ''}
              onChange={e => setFormData({ ...formData, street_name: e.target.value })}
            />

            <label htmlFor="barangay_subdivision">Barangay/Subdivision</label>
            <input
              id="barangay_subdivision"
              type="text"
              placeholder="Enter Barangay/Subdivision"
              value={formData.barangay_subdivision || ''}
              onChange={e => setFormData({ ...formData, barangay_subdivision: e.target.value })}
            />

            <label htmlFor="city_municipality">
              City Municipality <span className="required">*</span>
            </label>
            <input
              id="city_municipality"
              type="text"
              placeholder="Enter City Municipality"
              value={formData.city_municipality || ''}
              onChange={e => setFormData({ ...formData, city_municipality: e.target.value })}
              required
            />

            <label htmlFor="province">
              Province <span className="required">*</span>
            </label>
            <input
              id="province"
              type="text"
              placeholder="e.g., Cavite"
              value={formData.province || ''}
              onChange={e => setFormData({ ...formData, province: e.target.value })}
              required
            />

            <label htmlFor="postal_code">
              Postal Code <span className="required">*</span>
            </label>
            <input
              id="postal_code"
              type="text"
              placeholder="e.g., 1771"
              value={formData.postal_code || ''}
              onChange={e => {
                const raw = e.target.value.trim();

                // Allow only digits
                if (!/^[0-9]*$/.test(raw)) return;

                setFormData({ ...formData, postal_code: raw });
              }}
              required
            />

            <label htmlFor="country">
              Country <span className="required">*</span>
            </label>
            <input
              id="country"
              type="text"
              placeholder="e.g., Philippines"
              value={formData.country || ''}
              onChange={e => setFormData({ ...formData, country: e.target.value })}
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

export default EditPatientModal;
