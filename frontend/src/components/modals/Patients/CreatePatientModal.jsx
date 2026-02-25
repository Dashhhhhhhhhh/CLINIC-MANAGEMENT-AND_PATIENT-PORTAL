import { useState, useEffect } from 'react';

import { createPatient, getAvailableUsers } from '../../../api/patients';

import '../../CSS/PatientPage.css';

function CreatePatientModal({ isOpen, onClose, onCreated }) {
  const [error, setError] = useState(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [conditions, setConditions] = useState('');

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setSelectedUserId('');
      setConditions('');
      setAvailableUsers([]);
      setError(null);
      return;
    }

    const loadUsers = async () => {
      setIsUserLoading(true);
      setError(null);

      try {
        const data = await getAvailableUsers();
        if (data.success) {
          setAvailableUsers(data.users);
        } else {
          setError({ message: data.message || 'Failed to fetch users' });
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
        setIsUserLoading(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  const [addPatients, setAddPatients] = useState({
    user_id: '',
    first_name: '',
    middle_initial: '',
    last_name: '',
    birthdate: '',
    contact_number: '',
    medical_history: '',
    conditions: '',
    building_number: '',
    street_name: '',
    barangay_subdivision: '',
    city_municipality: '',
    province: '',
    postal_code: '',
    country: '',
  });

  const resetForm = () => {
    setAddPatients({
      user_id: '',
      first_name: '',
      middle_initial: '',
      last_name: '',
      birthdate: '',
      contact_number: '',
      medical_history: '',
      conditions: '',
      building_number: '',
      street_name: '',
      barangay_subdivision: '',
      city_municipality: '',
      province: '',
      postal_code: '',
      country: '',
    });
  };

  const handleAddPatient = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...addPatients,
        user_id: selectedUserId,
        conditions: conditions,
      };

      const result = await createPatient(payload);

      if (result.success) {
        resetForm();
        onCreated?.(result.patient ?? result.data);
        onClose();
      } else {
        setError({ message: result.message || 'Failed to add patient' });
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
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Create Patient</h2>
        {error && (
          <div className="error-banner">
            <p className="error-text">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}
        <form onSubmit={handleAddPatient}>
          <label htmlFor="user_id">User ID</label>
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
              availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))
            )}
          </select>

          <label htmlFor="first_name">First Name</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Enter first name"
            value={addPatients.first_name}
            onChange={e => setAddPatients({ ...addPatients, first_name: e.target.value })}
            autoFocus
          />

          <label htmlFor="middle_initial">Middle Initial</label>
          <input
            id="middle_initial"
            name="middle_initial"
            type="text"
            placeholder="Enter middle initial"
            value={addPatients.middle_initial}
            onChange={e => setAddPatients({ ...addPatients, middle_initial: e.target.value })}
          />

          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Enter last name"
            value={addPatients.last_name}
            onChange={e => setAddPatients({ ...addPatients, last_name: e.target.value })}
          />

          <label htmlFor="birthdate">Birthdate</label>
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            value={addPatients.birthdate || ''}
            onChange={e => {
              let raw = e.target.value;

              // If it contains "T", split and take the first part
              if (raw.includes('T')) {
                raw = raw.split('T')[0];
              }

              setAddPatients({ ...addPatients, birthdate: raw });
            }}
          />

          <label htmlFor="medical_history">Medical History</label>
          <textarea
            id="medical_history"
            maxLength={1000}
            rows={5}
            placeholder="Enter patient's medical history (max 1000 characters)..."
            value={addPatients.medical_history}
            onChange={e => setAddPatients({ ...addPatients, medical_history: e.target.value })}
          />

          <label htmlFor="contact_number">Contact Number</label>
          <input
            id="contact_number"
            name="contact_number"
            type="text"
            placeholder="e.g., 09123456789"
            value={addPatients.contact_number}
            onChange={e => {
              const raw = e.target.value;

              // Clear error if user is editing again
              if (error?.message === 'Invalid PH mobile number') {
                setError(null);
              }

              // Allow only digits and optional leading +
              if (!/^\+?[0-9]*$/.test(raw)) return;

              setAddPatients({ ...addPatients, contact_number: raw });
            }}
            onBlur={e => {
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
              setAddPatients({ ...addPatients, contact_number: raw });
            }}
          />

          <label htmlFor="conditions">Conditions</label>
          <textarea
            id="conditions"
            placeholder="e.g. Asthma, Diabetes, Allergies"
            value={conditions}
            onChange={e => setConditions(e.target.value)}
          />

          <label htmlFor="building_number">Building Number</label>
          <input
            id="building_number"
            name="building_number"
            type="text"
            placeholder="Must be AlphaNumeric only"
            value={addPatients.building_number}
            onChange={e => {
              const value = e.target.value;
              if (!/^[A-Za-z0-9]+$/.test(value)) return;
              setAddPatients({ ...addPatients, building_number: value });
            }}
          />

          <label htmlFor="street_name">Street Name</label>
          <input
            id="street_name"
            name="street_name"
            type="text"
            placeholder="Enter Street Name"
            value={addPatients.street_name}
            onChange={e => setAddPatients({ ...addPatients, street_name: e.target.value })}
          />

          <label htmlFor="barangay_subdivision">Barangay/Subdivision</label>
          <input
            id="barangay_subdivision"
            name="barangay_subdivision"
            type="text"
            placeholder="Enter Barangay/Subdivision"
            value={addPatients.barangay_subdivision}
            onChange={e =>
              setAddPatients({
                ...addPatients,
                barangay_subdivision: e.target.value,
              })
            }
          />

          <label htmlFor="city_municipality">City Municipality</label>
          <input
            id="city_municipality"
            name="city_municipality"
            type="text"
            placeholder="Enter City Municipality"
            value={addPatients.city_municipality}
            onChange={e =>
              setAddPatients({
                ...addPatients,
                city_municipality: e.target.value,
              })
            }
          />

          <label htmlFor="province">Province</label>
          <input
            id="province"
            name="province"
            type="text"
            placeholder="Enter Province"
            value={addPatients.province}
            onChange={e => setAddPatients({ ...addPatients, province: e.target.value })}
          />

          <label htmlFor="postal_code">Postal Code</label>
          <input
            id="postal_code"
            type="text"
            placeholder="e.g., 1771"
            value={addPatients.postal_code}
            onChange={e => {
              const raw = e.target.value.trim();
              if (!/^[0-9]*$/.test(raw)) return;
              setAddPatients({ ...addPatients, postal_code: raw });
            }}
          />

          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            type="text"
            placeholder="Enter Country"
            value={addPatients.country}
            onChange={e => setAddPatients({ ...addPatients, country: e.target.value })}
          />

          <div className="modal-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePatientModal;
