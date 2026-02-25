function PatientSummaryCard({ patient, onClear, compact, loading }) {
  if (!patient) return null;

  return (
    <div className="data-card patient-summary">
      <div className="patient-summary__header">
        <h3 className="patient-summary__title">Selected Patient</h3>
        <span className={`patient-summary__badge ${patient.status ? 'active' : 'archived'}`}>
          {patient.status ? 'Active' : 'Archived'}
        </span>
      </div>

      <div className="patient-summary__name">
        {patient.first_name} {patient.last_name}
      </div>

      <div className="patient-summary__meta">
        <p>
          <strong>Patient ID:</strong> {patient.patient_id}
        </p>
        {onClear && (
          <div className="patient-summary__actions">
            <button type="button" onClick={onClear}>
              Change Patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientSummaryCard;

/**
 * Future props:
 * - loading: used when a patient is selected but full details are still being fetched
 * - compact: renders a minimal version of the card (name + ID only) for reuse in tighter UIs
 */
