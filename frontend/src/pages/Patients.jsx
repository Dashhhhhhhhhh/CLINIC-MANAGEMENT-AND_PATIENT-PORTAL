import { useState, useEffect } from 'react';
import {
  createPatient,
  getAllPatient,
  getPatientById,
  updatePatient,
  toggleActivePatient,
} from '../api/patients';

function Patients() {
  //State Variables

  // fetchAll Variables

  const [patient, setPatient] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // handleAdd Variables

  const [addPatients, setAddPatients] = useState({
    user_id: '',
    patient_id: '',
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

  // dropDown User Variables

  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  // Conditions JSONB Variables

  const [conditions, setConditions] = useState([]);

  const handleMedicalHistoryChange = e => {
    setMedicalHistory(e.target.value);
  };

  // getPatientById Variables

  const [patientId, setPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  //  Fetch Doctors (Initial Load)

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setSuccessMessage('');
      setError(null);
      try {
        const result = await getAllPatient();
        setPatient(result.patient);
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
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Fetch Available Users

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/patients/available-users');
        const data = await response.json();

        if (data.success) {
          setAvailableUsers(data.users);
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
        setLoading(false);
      }
    };
    fetchAvailableUsers();
  }, []);

  // Create Patient Handler

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
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const payload = {
        ...addPatients,
        user_id: selectedUserId,
        conditions: conditions,
      };

      console.log('Final payload being sent:', payload);

      const result = await createPatient(payload);
      console.log(' Finished API call, proceeding...');
      resetForm();

      setSuccessMessage('Patient added successfully!');
      console.log('Created patient:', result);
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
      setLoading(false);
    }
  };

  // Fetch Patient by ID

  const fetchPatientById = async () => {
    try {
      const result = await getPatientById(patientId);

      if (result.success) {
        setSelectedPatient(result.patient);
        setSuccessMessage('Patient retrieved successfully!');
      } else {
        setError({ message: result.message || 'Patient not found' });
      }
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage =
          error.response.data?.message || error.response.data?.error || 'Server error occurred';
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
      setLoading(false);
    }
  };

  // Update patients Variables

  const [editPatients, setEditPatients] = useState({
    user_id: '',
    patient_id: '',
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

  const [isEditing, setIsEditing] = useState(false);

  const updatePatientById = async () => {
    setLoading(true);
    setSuccessMessage('');
    setError(null);
    console.log('Updating Patients with ID', editPatients.patient_id);
    try {
      const result = await updatePatient(editPatients.patient_id, {
        first_name: editPatients.first_name,
        middle_initial: editPatients.middle_initial,
        last_name: editPatients.last_name,
        birthdate: editPatients.birthdate,
        contact_number: editPatients.contact_number,
        medical_history: editPatients.medical_history,
        conditions: editPatients.conditions,
        building_number: editPatients.building_number,
        street_name: editPatients.street_name,
        barangay_subdivision: editPatients.barangay_subdivision,
        city_municipality: editPatients.city_municipality,
        province: editPatients.province,
        postal_code: editPatients.postal_code,
        country: editPatients.country,
      });
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
      setLoading(false);
    }
  };

  const handdleToggleActive = async () => {
    setLoading(true);
    setSuccessMessage('');
    setError;

    const newStatus = !selectedPatient.active;
    try {
      const result = await toggleActivePatient(selectedPatient.patient_id, !selectedPatient.active);

      setSelectedPatient(prev => ({ ...prev, active: !prev.active }));

      if (newStatus) {
        setSuccessMessage('Patient activated successfully');
      } else {
        setSuccessMessage('Staff deactivated successfully');
      }
      console.log('Staff active status toggle successfully');
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
      setLoading(false);
    }
  };

  if (loading) return <p>Loading Staff...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* ================= Patient List ================= */}
      <h2>Patient's Lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Patient ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>First Name</th>
          </tr>
        </thead>
        <tbody>
          {patient.map((patient, index) => (
            <tr key={patient.patient_id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{patient.patient_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{patient.first_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ================= Create Staff Form ================= */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Create Patient</h2>
        <form>
          <p>User ID</p>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            <option value="">--Select a User--</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
          <p>First Name</p>
          <input
            type="text"
            placeholder="Enter first name"
            value={addPatients.first_name}
            onChange={e => setAddPatients({ ...addPatients, first_name: e.target.value })}
          />
          <p>Middle Initial</p>
          <input
            type="text"
            placeholder="Enter middle initial"
            value={addPatients.middle_initial}
            onChange={e => setAddPatients({ ...addPatients, middle_initial: e.target.value })}
          />
          <p>Last Name</p>
          <input
            type="text"
            placeholder="Enter last name"
            value={addPatients.last_name}
            onChange={e => setAddPatients({ ...addPatients, last_name: e.target.value })}
          />
          <p>Birthdate</p>
          <input
            type="date"
            name="Enter birthdate"
            value={addPatients.birthdate}
            onChange={e => setAddPatients({ ...addPatients, birthdate: e.target.value })}
          />
          <label>
            Medical History:
            <textarea
              maxLength={1000}
              rows={5}
              placeholder="Enter patient's medical history (max 1000 characters)..."
              value={addPatients.medical_history}
              onChange={e => setAddPatients({ ...addPatients, medical_history: e.target.value })}
            />
          </label>
          <p>Contact Number</p>
          <input
            type="text"
            placeholder="e.g., 09123456789"
            value={addPatients.contact_number}
            onChange={e => {
              const raw = e.target.value;

              // Accept only numbers and "+"
              if (!/^\+?[0-9]*$/.test(raw)) return;
              setAddPatients({ ...addPatients, contact_number: raw });
            }}
            onBlur={e => {
              let raw = e.target.value.trim();

              // Convert 09xxxxxxxxx → +639xxxxxxxxx
              if (raw.startsWith('09')) {
                raw = '+639' + raw.slice(2);
              }

              // Validate final format
              if (!/^\+639\d{9}$/.test(raw)) {
                alert('Invalid PH mobile number');
                return;
              }

              setAddPatients({ ...addPatients, contact_number: raw });
            }}
          />
          <p>Conditions</p>
          <textarea
            placeholder="e.g. Asthma, Diabetes, Allergies"
            value={conditions}
            onChange={e => {
              const values = e.target.value;
              setConditions(values);
            }}
          />
          <p>Building Number</p>
          <input
            type="text"
            placeholder="Must be AlphaNumeric only"
            value={addPatients.building_number}
            onChange={e => {
              const value = e.target.value.trim();

              const valid = /^[A-Za-z0-9]+$/.test(value);
              if (!valid) return;

              setAddPatients({ ...addPatients, building_number: value });
            }}
          />
          <p>Street Name</p>
          <input
            type="text"
            placeholder="Enter Street Name"
            value={addPatients.street_name}
            onChange={e => setAddPatients({ ...addPatients, street_name: e.target.value })}
          />
          <p>Barangay/Subdivision</p>
          <input
            type="text"
            placeholder="Enter Barangay/Subdivision"
            value={addPatients.barangay_subdivision}
            onChange={e => setAddPatients({ ...addPatients, barangay_subdivision: e.target.value })}
          />
          <p>City Municipality</p>
          <input
            type="text"
            placeholder="Enter City Municipality"
            value={addPatients.city_municipality}
            onChange={e => setAddPatients({ ...addPatients, city_municipality: e.target.value })}
          />
          <p>Province</p>
          <input
            type="text"
            placeholder="Enter Province"
            value={addPatients.province}
            onChange={e => setAddPatients({ ...addPatients, province: e.target.value })}
          />
          <p>Postal Code</p>
          <input
            type="text"
            placeholder="e.g., 1771"
            value={addPatients.postal_code}
            onChange={e => {
              const raw = e.target.value.trim();

              const numbersOnly = /^[0-9]*$/.test(raw);
              if (!numbersOnly) return;

              setAddPatients({ ...addPatients, postal_code: raw });
            }}
          />
          <p>Country</p>
          <input
            type="text"
            placeholder="Enter Country"
            value={addPatients.country}
            onChange={e => setAddPatients({ ...addPatients, country: e.target.value })}
          />
          <button onClick={handleAddPatient}>Submit</button>

          {successMessage && <p>{successMessage}</p>}
        </form>
      </div>
      {/* ================= Search Staff By ID ================= */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Search by Staff ID</h3>

        <input
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
        />

        <button onClick={fetchPatientById}>Search</button>

        {selectedPatient && (
          <div>
            <p>patient_id: {selectedPatient.patient_id}</p>
            <p>first_name: {selectedPatient.first_name}</p>
            <p>middle_initial: {selectedPatient.middle_initial}</p>
            <p>last_name: {selectedPatient.last_name}</p>
            <p>birthdate: {selectedPatient.birthdate}</p>
            <p>contact_number: {selectedPatient.contact_number}</p>
            <p>medical_history: {selectedPatient.medical_history}</p>
            <p>
              conditions:{' '}
              {Array.isArray(selectedPatient.conditions) && selectedPatient.conditions.length > 0
                ? selectedPatient.conditions.join(', ')
                : 'None'}
            </p>
            <p>building_number: {selectedPatient.building_number}</p>
            <p>street_name: {selectedPatient.street_name}</p>
            <p>barangay_subdivision: {selectedPatient.barangay_subdivision}</p>
            <p>city_municipality: {selectedPatient.city_municipality}</p>
            <p>province: {selectedPatient.province}</p>
            <p>postal_code: {selectedPatient.postal_code}</p>
            <p>country: {selectedPatient.country}</p>
            <p>active: {selectedPatient.active ? 'Active' : 'Inactive'}</p>

            {/* ================= Update Patients By ID ================= */}

            <button
              onClick={() => {
                setEditPatients(selectedPatient);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
            {isEditing && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Edit Patients</h4>
                <p>First Name</p>
                <input
                  text="text"
                  placeholder="Enter First Name"
                  value={editPatients.first_name}
                  onChange={e => setEditPatients({ ...editPatients, first_name: e.target.value })}
                />
                <p>Middle Initial</p>
                <input
                  text="text"
                  placeholder="Enter Middle Initial"
                  value={editPatients.middle_initial || ''}
                  onChange={e =>
                    setEditPatients({ ...editPatients, middle_initial: e.target.value })
                  }
                />
                <p>Last Name</p>
                <input
                  text="text"
                  placeholder="Enter Last Name"
                  value={editPatients.last_name}
                  onChange={e => setEditPatients({ ...editPatients, last_name: e.target.value })}
                />
                <p>Birthdate</p>
                <input
                  type="date"
                  name="Enter birthdate"
                  value={editPatients.birthdate}
                  onChange={e => setEditPatients({ ...editPatients, birthdate: e.target.value })}
                />
                <label>
                  Medical History:
                  <textarea
                    maxLength={1000}
                    rows={5}
                    placeholder="Enter patient's medical history (max 1000 characters)..."
                    value={editPatients.medical_history}
                    onChange={e =>
                      setEditPatients({ ...editPatients, medical_history: e.target.value })
                    }
                  />
                </label>
                <p>Contact Number</p>
                <input
                  type="text"
                  placeholder="e.g., 09123456789"
                  value={editPatients.contact_number}
                  onChange={e => {
                    const raw = e.target.value;

                    // Accept only numbers and "+"
                    if (!/^\+?[0-9]*$/.test(raw)) return;
                    setEditPatients({ ...editPatients, contact_number: raw });
                  }}
                  onBlur={e => {
                    let raw = e.target.value.trim();

                    // Convert 09xxxxxxxxx → +639xxxxxxxxx
                    if (raw.startsWith('09')) {
                      raw = '+639' + raw.slice(2);
                    }

                    // Validate final format
                    if (!/^\+639\d{9}$/.test(raw)) {
                      alert('Invalid PH mobile number');
                      return;
                    }

                    setEditPatients({ ...editPatients, contact_number: raw });
                  }}
                />
                <p>Conditions</p>
                <textarea
                  placeholder="e.g. Asthma, Diabetes, Allergies"
                  value={
                    Array.isArray(editPatients.conditions)
                      ? editPatients.conditions.join(', ')
                      : editPatients.conditions || ''
                  }
                  onChange={e => {
                    setEditPatients({
                      ...editPatients,
                      conditions: e.target.value,
                    });
                  }}
                />
                <p>Building Number</p>
                <input
                  type="text"
                  placeholder="Must be AlphaNumeric only"
                  value={editPatients.building_number}
                  onChange={e => {
                    const value = e.target.value.trim();

                    const valid = /^[A-Za-z0-9]+$/.test(value);
                    if (!valid) return;

                    setEditPatients({ ...editPatients, building_number: value });
                  }}
                />
                <p>Street Name</p>
                <input
                  type="text"
                  placeholder="Enter Street Name"
                  value={editPatients.street_name}
                  onChange={e => setEditPatients({ ...editPatients, street_name: e.target.value })}
                />
                <p>Barangay/Subdivision</p>
                <input
                  type="text"
                  placeholder="Enter Barangay/Subdivision"
                  value={editPatients.barangay_subdivision}
                  onChange={e =>
                    setEditPatients({ ...editPatients, barangay_subdivision: e.target.value })
                  }
                />
                <p>City Municipality</p>
                <input
                  type="text"
                  placeholder="Enter City Municipality"
                  value={editPatients.city_municipality}
                  onChange={e =>
                    setEditPatients({ ...editPatients, city_municipality: e.target.value })
                  }
                />
                <p>Province</p>
                <input
                  type="text"
                  placeholder="Enter Province"
                  value={editPatients.province}
                  onChange={e => setEditPatients({ ...editPatients, province: e.target.value })}
                />
                <p>Postal Code</p>
                <input
                  type="text"
                  placeholder="e.g., 1771"
                  value={editPatients.postal_code}
                  onChange={e => {
                    const raw = e.target.value.trim();

                    const numbersOnly = /^[0-9]*$/.test(raw);
                    if (!numbersOnly) return;

                    setEditPatients({ ...editPatients, postal_code: raw });
                  }}
                />
                <p>Country</p>
                <input
                  type="text"
                  placeholder="Enter Country"
                  value={editPatients.country}
                  onChange={e => setEditPatients({ ...editPatients, country: e.target.value })}
                />
                <button onClick={updatePatientById}>Update</button>

                <button onClick={handdleToggleActive}>Toggle Active</button>
                {successMessage && <p>{successMessage}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Patients;
