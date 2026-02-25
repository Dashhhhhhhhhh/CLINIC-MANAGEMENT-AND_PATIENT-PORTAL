import { useState, useEffect } from 'react';

import {
  createDoctor,
  getAvailableDoctorUsers,
  getAvailableSpecializations,
} from '../../../api/doctors';

function CreateDoctorModal({ isOpen, onClose, onCreated }) {
  const [error, setError] = useState(null);

  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState('');

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [isSpecializationLoading, setIsSpecializationLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addDoctor, setAddDoctor] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    contact_number: '',
  });

  const resetForm = () => {
    setAddDoctor({
      first_name: '',
      middle_initial: '',
      last_name: '',
      contact_number: '',
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setSelectedSpecializationId('');
      setSelectedUserId('');
      setError(null);
      setIsSubmitting(false);
      setIsSpecializationLoading(false);
      setIsUserLoading(false);
      return;
    }

    const loadSpecializations = async () => {
      setIsSpecializationLoading(true);
      setError(null);

      try {
        const data = await getAvailableSpecializations();
        if (data.success) {
          setAvailableSpecializations(data.data || []);
        } else {
          setError({
            type: 'FETCH_FAILED',
            message: data.message || 'Failed to fetch specializations',
          });
        }
      } catch (error) {
        let errorMessage = '';

        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
          console.error('Backend error:', errorMessage);
          setError({ type: 'SERVER_ERROR', message: errorMessage });
        } else if (error.request) {
          errorMessage = 'No response from server';
          console.error('Network error:', errorMessage);
          setError({ type: 'NETWORK_ERROR', message: errorMessage });
        } else {
          errorMessage = error.message;
          console.error('Unexpected error:', errorMessage);
          setError({ type: 'UNEXPECTED_ERROR', message: errorMessage });
        }
      } finally {
        setIsSpecializationLoading(false);
      }
    };

    const loadUsers = async () => {
      setIsUserLoading(true);
      setError(null);

      try {
        const data = await getAvailableDoctorUsers();
        if (data.success) {
          setAvailableUsers(data.users);
        } else {
          setError({ type: 'FETCH_FAILED', message: data.message || 'Failed to fetch users' });
        }
      } catch (error) {
        let errorMessage = '';

        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
          console.error('Backend error:', errorMessage);
          setError({ type: 'SERVER_ERROR', message: errorMessage });
        } else if (error.request) {
          errorMessage = 'No response from server';
          console.error('Network error:', errorMessage);
          setError({ type: 'NETWORK_ERROR', message: errorMessage });
        } else {
          errorMessage = error.message;
          console.error('Unexpected error:', errorMessage);
          setError({ type: 'UNEXPECTED_ERROR', message: errorMessage });
        }
      } finally {
        setIsUserLoading(false);
      }
    };

    loadSpecializations();
    loadUsers();
  }, [isOpen]);

  const handleAddDoctor = async e => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!addDoctor.first_name.trim()) {
        setError({ message: 'First name is required' });
        setIsSubmitting(false);
        return;
      }

      if (!addDoctor.last_name.trim()) {
        setError({ message: 'Last name is required' });
        setIsSubmitting(false);
        return;
      }

      if (!addDoctor.license_number.trim()) {
        setError({ message: 'License number is required' });
        setIsSubmitting(false);
        return;
      }
      if (!selectedSpecializationId) {
        setError({ message: 'Specialization is required' });
        setIsSubmitting(false);
        return;
      }

      if (!selectedUserId) {
        setError({ message: 'User is required' });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        first_name: addDoctor.first_name.trim(),
        last_name: addDoctor.last_name.trim(),
        license_number: addDoctor.license_number.trim(),
        specialization_id: selectedSpecializationId,
        user_id: selectedUserId,
      };

      if (addDoctor.middle_initial.trim()) {
        payload.middle_initial = addDoctor.middle_initial.trim();
      }

      if (addDoctor.contact_number.trim()) {
        payload.contact_number = addDoctor.contact_number.trim();
      }

      const result = await createDoctor(payload);

      if (result.success) {
        resetForm();
        onCreated?.(result.doctor ?? result.data);
        onClose();
      } else {
        setError({ message: result.message || 'Failed to add doctor.' });
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
        <h2>Create Doctor</h2>

        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleAddDoctor}>
          {/* User selection */}
          <label htmlFor="user_id">User</label>
          <select
            id="user_id"
            name="user_id"
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            disabled={isUserLoading}
          >
            <option value="">--Select a User--</option>
            {isUserLoading ? (
              <option disabled>Loading users...</option>
            ) : (
              (availableUsers ?? []).map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))
            )}
          </select>

          {/* Specialization selection */}
          <label htmlFor="specialization_id">Specialization</label>
          <select
            id="specialization_id"
            value={selectedSpecializationId}
            onChange={e => setSelectedSpecializationId(e.target.value)}
            disabled={isSpecializationLoading}
          >
            <option value="">--Select a Specialization--</option>
            {isSpecializationLoading ? (
              <option disabled>Loading Specializations...</option>
            ) : (
              availableSpecializations.map(s => (
                <option key={s.specialization_id} value={s.specialization_id}>
                  {s.specialization_name}
                </option>
              ))
            )}
          </select>

          {/* Doctor details */}
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Enter first name"
              value={addDoctor.first_name}
              onChange={e => setAddDoctor({ ...addDoctor, first_name: e.target.value })}
              autoFocus
            />

            <label htmlFor="middle_initial">Middle Initial</label>
            <input
              id="middle_initial"
              name="middle_initial"
              type="text"
              placeholder="Enter middle initial"
              value={addDoctor.middle_initial}
              onChange={e => setAddDoctor({ ...addDoctor, middle_initial: e.target.value })}
            />

            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Enter last name"
              value={addDoctor.last_name}
              onChange={e => setAddDoctor({ ...addDoctor, last_name: e.target.value })}
            />

            <label htmlFor="contact_number">Contact Number</label>
            <input
              id="contact_number"
              name="contact_number"
              type="text"
              placeholder="e.g., 09123456789"
              value={addDoctor.contact_number}
              onChange={e => {
                const raw = e.target.value;

                // Clear error if it's the contact format error
                if (error?.type === 'VALIDATION_ERROR') {
                  setError(null);
                }

                // Allow only digits and optional leading +
                if (!/^\+?[0-9]*$/.test(raw)) return;

                setAddDoctor({ ...addDoctor, contact_number: raw });
              }}
              onBlur={e => {
                let raw = e.target.value.trim();
                if (!raw) return;

                // Convert 09XXXXXXXXX → +639XXXXXXXXX
                if (raw.startsWith('09')) {
                  raw = '+639' + raw.slice(2);
                }

                // Validate final PH format
                if (!/^\+639\d{9}$/.test(raw)) {
                  setError({ type: 'VALIDATION_ERROR', message: 'Invalid PH mobile number' });
                  return;
                }

                // Save normalized number
                setAddDoctor({ ...addDoctor, contact_number: raw });
              }}
            />
            <label htmlFor="License Number">License Number</label>
            <input
              id="license_number"
              name="license_numberber"
              type="text"
              placeholder="e.g., 1234567"
              value={addDoctor.license_number}
              maxLength={7}
              onChange={e => setAddDoctor({ ...addDoctor, license_number: e.target.value })}
              onBlur={e => {
                const raw = e.target.value.trim();
                if (!/^\d{7}$/.test(raw)) {
                  setError({ message: 'License number must be exactly 7 digits' });
                } else {
                  setError(null);
                }
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

export default CreateDoctorModal;
