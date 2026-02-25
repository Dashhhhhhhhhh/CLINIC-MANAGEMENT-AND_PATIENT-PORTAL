import { useState, useEffect } from 'react';

import { createStaff, getAvailablePosition } from '../../../api/staff';

function CreateStaffModal({ isOpen, onClose, onCreated }) {
  const [error, setError] = useState(null);

  const [availablePositions, setAvailablePositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState('');

  const [isPositionLoading, setIsPositionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addStaff, setAddStaff] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    contact_number: '' || null,
  });

  const resetForm = () => {
    setAddStaff({
      first_name: '',
      middle_initial: '',
      last_name: '',
      contact_number: '',
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setSelectedPositionId('');
      setError(null);
      setIsSubmitting(false);
      setIsPositionLoading(false);
      return;
    }

    const loadPositions = async () => {
      setIsPositionLoading(true);
      setError(null);

      try {
        const data = await getAvailablePosition();
        if (data.success) {
          setAvailablePositions(data.positions);
        } else {
          setError({ message: data.message || 'Failed to fetch positions' });
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

        setError({ message: errorMessage });
      } finally {
        setIsPositionLoading(false);
      }
    };

    loadPositions();
  }, [isOpen]);

  const handleAddStaff = async e => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!addStaff.first_name.trim()) {
        setError({ message: 'First name is required' });
        setIsSubmitting(false);
        return;
      }

      if (!addStaff.last_name.trim()) {
        setError({ message: 'Last Name is required' });
        setIsSubmitting(false);

        return;
      }

      if (!selectedPositionId) {
        setError({ message: 'Position is required' });
        setIsSubmitting(false);

        return;
      }

      const payload = {
        first_name: addStaff.first_name.trim(),
        last_name: addStaff.last_name.trim(),
        position_id: selectedPositionId,
      };

      if (addStaff.middle_initial.trim()) {
        payload.middle_initial = addStaff.middle_initial.trim();
      }
      if (addStaff.contact_number.trim()) {
        payload.contact_number = addStaff.contact_number.trim();
      }

      const result = await createStaff(payload);

      if (result.success) {
        resetForm();
        onCreated?.(result.staff ?? result.data);
        onClose();
      } else {
        setError({ message: result.message || 'Failed to add staff' });
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
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Create Staff</h2>
        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}
        <form onSubmit={handleAddStaff}>
          <label htmlFor="position_id">Position</label>
          <select
            id="position_id"
            value={selectedPositionId}
            onChange={e => setSelectedPositionId(e.target.value)}
            disabled={isPositionLoading}
          >
            {isPositionLoading ? (
              <option value="">Loading positions...</option>
            ) : availablePositions && availablePositions.length > 0 ? (
              availablePositions.map(p => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name}
                </option>
              ))
            ) : (
              <option disabled>No positions available</option>
            )}
          </select>

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Enter first name"
              value={addStaff.first_name}
              onChange={e => setAddStaff({ ...addPatients, first_name: e.target.value })}
              autoFocus
            />

            <label htmlFor="middle_initial">Middle Initial</label>
            <input
              id="middle_initial"
              name="middle_initial"
              type="text"
              placeholder="Enter middle initial"
              value={addStaff.middle_initial}
              onChange={e => setAddStaff({ ...addStaff, middle_initial: e.target.value })}
            />

            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Enter last name"
              value={addStaff.last_name}
              onChange={e => setAddStaff({ ...addStaff, last_name: e.target.value })}
            />

            {/* Contact Number */}
            <label htmlFor="contact_number">Contact Number</label>
            <input
              id="contact_number"
              name="contact_number"
              type="text"
              placeholder="e.g., 09123456789"
              value={addStaff.contact_number}
              onChange={e => {
                const raw = e.target.value;

                // Clear error if it's the contact format error
                if (error?.message === 'Invalid PH mobile number') {
                  setError(null);
                }

                // Allow only digits and optional leading +
                if (!/^\+?[0-9]*$/.test(raw)) return;

                setAddStaff({ ...addStaff, contact_number: raw });
              }}
              onBlur={e => {
                if (!raw) return;

                let raw = e.target.value.trim();

                // Convert 09XXXXXXXXX → +639XXXXXXXXX
                if (raw.startsWith('09')) {
                  raw = '+639' + raw.slice(2);
                }

                // Validate final PH format
                if (!/^\+639\d{9}$/.test(raw)) {
                  setError({ message: 'Invalid PH mobile number' });
                  return;
                }

                // Save normalized number
                setAddStaff({ ...addStaff, contact_number: raw });
              }}
            />

            <div className="modal-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStaffModal;
