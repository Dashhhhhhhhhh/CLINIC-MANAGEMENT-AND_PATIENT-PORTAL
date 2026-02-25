import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { getLatestResults, getResultById } from '../api/results';
import ViewResultModal from '../components/modals/Results/ViewResultModal';
import EditPatientModal from '../components/modals/Patients/EditPatientModal';

import '../components/CSS/PatientOverview.css';
import '../components/CSS/LatestResults.css';
import '../components/CSS/shared-ui.css';
import { getPatientById } from '../api/patients';

function PatientOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [latestResults, setLatestResults] = useState([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedResult, setSelectedResult] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState(null);

  const latest = latestResults?.[0];

  const id = patient?.patient_id;

  const displayId = (patientId || patient?.patient_id || '').slice(-6);

  function getAge(birthdateStr) {
    if (!birthdateStr) return '';

    const birthDate = new Date(birthdateStr); // convert string to Date
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    // adjust if birthday hasn't happened yet this year
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    return age;
  }

  function buildAddress(patient) {
    const building = patient?.building_number;
    const street = patient?.street_name;
    const barangay = patient?.barangay_subdivision;
    const city = patient?.city_municipality;
    const province = patient?.province;
    const postal = patient?.postal_code;
    const country = patient?.country;

    const parts = [building, street, barangay, city, province, postal, country];

    const filtered = parts.filter(Boolean);
    const address = filtered.join(', ');

    return filtered.length ? `Address: ${address}` : 'Address: None';
  }

  function conditionsCount(patient) {
    const conditions = patient?.conditions;

    if (!conditions) return 'Conditions: None';

    if (Array.isArray(conditions)) {
      return `Conditions: ${conditions.length}`;
    }

    const count = conditions
      .split(',')
      .map(c => c.trim())
      .filter(c => c).length;

    return `Conditions: ${count}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', // "Jan"
      day: 'numeric', // "1"
      year: 'numeric', // "2003"
    });
  }

  const fetchPatient = async () => {
    try {
      if (!patientId) return;
      setPatientLoading(true);
      setPatientError(null);

      const result = await getPatientById(patientId);
      if (result.success) {
        setPatient(result.patient);
      } else {
        setPatientError({ message: result.message || 'Patient not found' });
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
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!patientId) return;

        const result = await getLatestResults(patientId);
        if (result.success) {
          setLatestResults(result.data);
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
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [patientId]);

  const handleView = async resultId => {
    if (!resultId) return;

    setError(null);
    setViewLoading(true);
    try {
      const result = await getResultById(resultId);

      if (result.success) {
        setSelectedResult(result.data);
        setIsViewModalOpen(true);
      } else {
        setError({ message: result.message || 'Result not found' });
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
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setSelectedResult(null);
    setIsViewModalOpen(false);
  };

  const openEditPatientModal = () => {
    setIsEditOpen(true);
  };

  const closeEditPatientModal = () => {
    setIsEditOpen(false);
  };

  if (loading || patientLoading) return <p>Loading...</p>;
  if (patientError) return <p>Error: {patientError.message}</p>;
  if (error) return <p>Error: {error.message}</p>;

  console.log('Patient data:', patient);

  return (
    <div>
      <div className="patient-profile-card">
        <h2 className="patient-overview__section-title">Patient Overview</h2>
        {/* Top section */}
        <div className="patient-header__top">
          <div className="patient-header__name">
            {patient?.first_name}
            {patient?.middle_initial && <span>{patient?.middle_initial}</span>} {patient?.last_name}
          </div>

          <span
            className={`patient-status-badge ${
              patient?.active ? 'patient-status-badge--active' : 'patient-status-badge--inactive'
            }`}
          >
            {patient?.active ? 'Active' : 'Inactive'}
          </span>

          <button className="patient-header__edit-btn" onClick={openEditPatientModal}>
            Edit
          </button>
        </div>

        <div className="patient-header__summary">
          <span className="patient-summary-item">ID: {displayId}</span>

          <span className="patient-summary-item">Age: {getAge(patient?.birthdate)} yrs</span>

          <span className="patient-summary-item"> {conditionsCount(patient)}</span>

          <span
            className={`patient-summary-item ${latest ? 'patient-summary-item--highlight' : ''}`}
          >
            Latest Result: {latest ? `${latest.status} • ${formatDate(latest.created_at)}` : 'None'}
          </span>
        </div>

        {/* Meta info */}
        <div className="patient-header__meta">
          <div className="patient-header__meta-item">Contact Info: {patient?.contact_number}</div>
          <div className="patient-header__meta-item">
            Birthdate: {formatDate(patient?.birthdate)}
          </div>
        </div>

        <div className="patient-header__address">{buildAddress(patient)}</div>

        {/* Conditions */}
        <p className="patient-section-label">Conditions</p>
        <div className="patient-header__conditions">
          {Array.isArray(patient?.conditions) ? (
            patient.conditions.length > 0 ? (
              patient.conditions.map((cond, idx) => (
                <span key={idx} className="patient-condition-tag">
                  {cond}
                </span>
              ))
            ) : (
              <p>No conditions recorded</p>
            )
          ) : typeof patient?.conditions === 'string' && patient.conditions.trim() !== '' ? (
            <p>{patient.conditions}</p>
          ) : (
            <p>No conditions recorded</p>
          )}
        </div>
      </div>
      <div className="page-toolbar">
        <button className="page" onClick={() => navigate('/dashboard/patients')}>
          Back
        </button>
      </div>
      <h2 className="patient-overview__section-title">Latest Results</h2>
      <div className="results-container">
        {latestResults.length === 0 ? (
          <p>No results found</p>
        ) : (
          latestResults.map(r => (
            <div className="result-card" key={r.result_id}>
              <div className="result-card__header">
                <div className="result-card__left">
                  <span className={`test-badge test-${r.TestType?.test_type_name.toLowerCase()}`}>
                    {r.TestType?.test_type_name}
                  </span>
                </div>
                <span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span>
              </div>
              <p className="result-card__patient">
                {r.patient?.first_name} {r.patient?.last_name}
              </p>
              <p className="result-card__meta">{r.created_at}</p>
              <div className="result-card__actions">
                <button onClick={() => handleView(r.result_id)}>View</button>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="view-history-button"
        onClick={() => navigate(`/dashboard/patients/${patientId}/results`)}
      >
        View full History
      </button>
      {isViewModalOpen && (
        <ViewResultModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          result={selectedResult}
          loading={viewLoading}
        />
      )}
      {isEditOpen && (
        <EditPatientModal
          isOpen={isEditOpen}
          onClose={closeEditPatientModal}
          patient={patient}
          onUpdated={() => {
            fetchPatient();
            closeEditPatientModal();
          }}
        />
      )}
    </div>
  );
}

export default PatientOverview;
