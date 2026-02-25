import { useState, useEffect } from 'react';

import { getAllPatient } from '../../../api/patients';
import PatientSummaryCard from '../../Shared/PatientSummaryCard';
import { getAllTestTypes } from '../../../api/testTypes';

import { createResult, getResultById } from '../../../api/results';

import '../../CSS/CreateResultModal.css';
import '../../CSS/shared-ui.css';

import XrayFormSection from '../../../features/results/components/CreateResultModal/sections/XrayFormSection';
import UltrasoundFormSection from '../../../features/results/components/CreateResultModal/sections/UltrasoundFormSection';
import HematologyFormSection from '../../../features/results/components/CreateResultModal/sections/HematologyFormSection';
import UrinalysisFormSection from '../../../features/results/components/UrinalysisFormSection';

function CreateResultModal({ isOpen, onClose, resetAll }) {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [isPatientLoading, setIsPatientLoading] = useState(false);

  const [searchPatient, setSearchPatient] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [flashPatientId, setFlashPatientId] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [testTypes, setTestTypes] = useState([]);
  const [selectedTestTypeId, setSelectedTestTypeId] = useState('');
  const [loadingTestTypes, setLoadingTestTypes] = useState(false);
  const [testTypesError, setTestTypesError] = useState(null);

  const [selectedBillingItemId, setSelectedBillingItemId] = useState('');
  const [note, setNote] = useState('');
  const [creatingResult, setCreatingResult] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdResultId, setCreatedResultId] = useState(null);
  const [createdTestTypeName, setCreatedTestTypeName] = useState(null);

  const canCreate = selectedPatient && selectedTestTypeId && !creatingResult && !createdResultId;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchPatient);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchPatient]);

  useEffect(() => {
    if (!flashPatientId) return;

    const t = setTimeout(() => setFlashPatientId(null), 1200);
    return () => clearTimeout(t);
  }, [flashPatientId]);

  const handleSearchChange = e => {
    setSearchPatient(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      setIsPatientLoading(true);
      setError(null);

      try {
        const result = await getAllPatient({ search: debouncedSearch, page, limit });

        if (result.success) {
          setPatients(result.data);
          setMeta(result.meta);
        } else {
          setError({ type: 'FETCH_FAILED', message: result.message });
        }
      } catch (err) {
        setError({ type: 'FETCH_FAILED', message: err.message });
      } finally {
        setIsPatientLoading(false);
      }
    };

    if (debouncedSearch.trim().length < 1) {
      setPatients([]);
      setMeta(null);
      return;
    }
    fetchPatients();
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    if (!selectedPatient) return;
    setSelectedTestTypeId('');
    setTestTypes([]);
    setTestTypesError(null);
    setSelectedBillingItemId('');
    setNote('');
    setCreatedResultId(null);
    setCreatedTestTypeName(null);
    setCreateError(null);

    const fetchTestTypes = async () => {
      setLoadingTestTypes(true);
      try {
        const result = await getAllTestTypes();
        if (result.success) {
          setTestTypes(result.data);
        } else {
          setTestTypesError({ type: 'FETCH_FAILED', message: result.message });
        }
      } catch (err) {
        setTestTypesError({ type: 'FETCH_FAILED', message: err.message });
      } finally {
        setLoadingTestTypes(false);
      }
    };
    fetchTestTypes();
  }, [selectedPatient]);

  const handleCreateResult = async () => {
    setCreateError('');
    setCreatingResult(true);

    const payload = {
      patient_id: selectedPatient?.patient_id,
      test_type_id: selectedTestTypeId,
      result_data: { note: note.trim() || '' },
    };

    try {
      const result = await createResult(payload);

      const newResultId = result?.data?.result_id;

      if (!newResultId) {
        setCreateError('Failed to create result: no result_id returned from server.');
        return;
      }

      if (newResultId) {
        setCreatedResultId(newResultId);
      }
      const selectedType = testTypes.find(t => t.test_type_id === selectedTestTypeId);

      setCreatedTestTypeName(selectedType?.test_type_name || null);
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to create result'
      );
    } finally {
      setCreatingResult(false);
    }
  };

  const handleDone = () => {
    resetAll?.();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleDone}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3 className="create-result-modal__title">Create Result</h3>
        {/* ================= PATIENT CARD ================= */}
        <div className="data-card create-result-modal__patient-card">
          {!selectedPatient ? (
            <div className="patients-table-wrapper">
              <div className="create-result-modal__search-row">
                <div className="create-result-modal__search">
                  <label className="control__label">Search Patient</label>
                  <input
                    className="control__input"
                    type="text"
                    value={searchPatient}
                    onChange={handleSearchChange}
                    placeholder="Type a name or ID…"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setSearchPatient('');
                    setPatients([]);
                    setMeta(null);
                    setPage(1);
                  }}
                  disabled={!searchPatient}
                >
                  Clear
                </button>
              </div>

              {!searchPatient && <div className="search-hint">Type to search patients</div>}

              {isPatientLoading && <div className="spinner">Loading patients...</div>}

              {!isPatientLoading && patients.length === 0 && (
                <div className="no-results">No patients found</div>
              )}

              {!isPatientLoading && patients.length > 0 && (
                <table className="table-ui patients-table">
                  <thead>
                    <tr>
                      <th className="table-ui__th">Patient ID</th>
                      <th className="table-ui__th">Patient Name</th>
                      <th className="table-ui__th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.patient_id} onClick={() => setSelectedPatient(p)}>
                        <td className="table-ui__td">{p.patient_id}</td>
                        <td className="table-ui__td">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="table-ui__td">{p.status ? 'Active' : 'Archived'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <PatientSummaryCard
              patient={selectedPatient}
              onClear={() => setSelectedPatient(null)}
            />
          )}
        </div>
        {/* ================= TEST TYPE CARD ================= */}
        {selectedPatient && (
          <div className="data-card create-result-modal__test-type-card">
            {loadingTestTypes && <div className="spinner">Loading test types...</div>}

            {!loadingTestTypes && (
              <>
                <h3 className="test-type__title">Test Type</h3>

                <select
                  className="test-type__select"
                  value={selectedTestTypeId}
                  onChange={e => setSelectedTestTypeId(e.target.value)}
                  disabled={testTypes.length === 0}
                >
                  <option value="">Select test type...</option>
                  {testTypes.map(tt => (
                    <option key={tt.test_type_id} value={tt.test_type_id}>
                      {tt.test_type_name}
                    </option>
                  ))}
                </select>

                {testTypesError && <div className="error-message">{testTypesError.message}</div>}

                {!testTypesError && testTypes.length === 0 && (
                  <div className="no-results">No test types available</div>
                )}
              </>
            )}
          </div>
        )}
        {selectedPatient && selectedTestTypeId && (
          <div className="data-card billing-item-card">
            <div className="data-card billing-item-card">
              <label htmlFor="billing-item">Billing Item ID</label>
              <input
                id="billing-item"
                type="text"
                placeholder="Paste billing item UUID..."
                value={selectedBillingItemId}
                onChange={e => setSelectedBillingItemId(e.target.value)}
              />
            </div>
          </div>
        )}
        {selectedPatient && selectedTestTypeId && (
          <div className="data-card billing-item-note">
            <label htmlFor="note">Note</label>
            <input
              id="note"
              type="text"
              placeholder="note"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        )}

        <div className="modal-body">
          {createdTestTypeName === 'x-ray' && (
            <XrayFormSection resultId={createdResultId} onClose={handleDone} />
          )}

          {createdTestTypeName === 'ultrasound' && (
            <UltrasoundFormSection resultId={createdResultId} onClose={handleDone} />
          )}

          {createdTestTypeName === 'hematology' && (
            <HematologyFormSection resultId={createdResultId} onClose={handleDone} />
          )}

          {createdTestTypeName === 'urinalysis' && (
            <UrinalysisFormSection resultId={createdResultId} onClose={handleDone} />
          )}
        </div>

        <div className="form-footer"></div>
        {/* ================= ACTIONS ================= */}
        <div className="modal-actions">
          {createError && <div className="error-message">{createError}</div>}
          <button type="button" onClick={handleCreateResult} disabled={!canCreate}>
            {creatingResult ? 'Creating…' : 'Create Result'}
          </button>

          <button type="button" onClick={handleDone}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateResultModal;
