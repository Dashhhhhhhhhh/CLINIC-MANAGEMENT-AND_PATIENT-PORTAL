import { useState, useEffect } from 'react';

import { createResult, getAllResult, getResultById, deleteResult } from '../api/results';
import ViewResultModal from '../components/modals/Results/ViewResultModal';
import DeleteResultModal from '../components/modals/Results/DeleteResultModal';
import UpdateHematologyModal from '../components/modals/Results/update/UpdateHematologyModal';

function Result() {
  /* ============================================================
     🔹 MAIN BILLING LIST STATE
     - billing: stores all billing records
     - loading: controls loading display
     - successMessage / error: feedback for create operations
  ============================================================ */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  /* ============================================================
     🔹 DROPDOWN — SELECT RESULT ID 
  ============================================================ */

  const [selectedResultId, setSelectedResultId] = useState('');

  /* ============================================================
     🔹 FETCH ALL RESULTS ON FIRST LOAD 
  ============================================================ */

  const fetchResult = async () => {
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const result = await getAllResult();
      console.log('API response:', result);
      setResults(result.data);
    } catch (error) {
      let errorMessage = '';

      // Detailed error handling for clarity
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchResult();
  }, []);

  /* ============================================================
     🔹 Handle Toggle Delete function
  ============================================================ */

  async function handleToggleDelete() {
    if (!selectedResult) return;
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const result = await deleteResult(selectedResult.result_id, !selectedResult.is_deleted);
      setSuccessMessage(
        selectedResult.is_deleted ? 'Result restored successfully.' : 'Result deleted successfully.'
      );
      console.log('Result deleted:', result);
      await fetchResult();
      closeDeleteResultItemModal();
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }
      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  }
  /* ============================================================
     🔹 VIEW RESULT MODAL OPEN/CLOSE CONTROL
  ============================================================ */
  const [isViewResultItemOpen, setIsViewResultItemOpen] = useState(false);

  function closeViewResultItemModal() {
    setIsViewResultItemOpen(false);
    setSelectedResultId(null);
  }

  /* ============================================================
     🔹 Open View Modal function
  ============================================================ */

  function openViewResultModal(result_id) {
    setSelectedResultId(result_id);
    setIsViewResultItemOpen(true);
  }

  /* ============================================================
     🔹 Open Delete Modal function
  ============================================================ */

  const [selectedResult, setSelectedResult] = useState(null);
  const [isDeleteResultItemOpen, setIsDeleteResultItemOpen] = useState(false);

  function openDeleteResultModal(result) {
    setSelectedResult(result);
    setIsDeleteResultItemOpen(true);
  }

  function closeDeleteResultItemModal() {
    setIsDeleteResultItemOpen(false);
    setSelectedResult(null);
  }

  /* ============================================================
     🔹 Open Update Modal function
  ============================================================ */

  const [activeUpdateType, setActiveUpdateType] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  /* ============================================================
     🔹 Open update Modal function
  ============================================================ */

  function openUpdateModal(result) {
    setSelectedResult(result);
    setActiveUpdateType(result.test_type_name);
    setIsUpdateModalOpen(true);
  }

  function closeUpdateModal() {
    setIsUpdateModalOpen(false);
    setActiveUpdateType(null);
    setSelectedResult(null);
  }

  /* ============================================================
     🔹 HANDLER FOR onUpdated
  ============================================================ */

  function handleUpdateSuccess() {
    fetchResult();
    closeUpdateModal();
  }

  /* ============================================================
     🔹 EARLY RETURN FOR LOADING / ERROR
  ============================================================ */
  if (loading) return <p>Loading Results...</p>;
  if (error) return <p>Error: {error.message}</p>;

  /* ============================================================
     🔹 JSX STARTS HERE
     Display billing list, create billing form, and modal
  ============================================================ */
  return (
    <div>
      {/* ========================================================
          RESULT TABLE (LIST OF ALL RESULTS)
      ======================================================== */}
      <h2>Result Lists</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Result ID</th>
            <th>Patient ID</th>
            <th>Result Type</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Active Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={7}>No results to show</td>
            </tr>
          ) : (
            results.map(r => {
              const patientName = [r.patient?.first_name, r.patient?.last_name]
                .filter(n => n && n.trim() !== '')
                .join(' ');

              const displayPatient = patientName.length > 0 ? patientName : 'Patient unavailable';
              return (
                <tr key={r.result_id}>
                  <td>{r.result_id}</td>
                  <td>{displayPatient}</td>
                  <td>{r.TestType ? `${r.TestType.test_type_name}` : 'Test type unavailable'}</td>
                  <td>{r.status}</td>
                  <td>{r.created_by}</td>
                  <td>{r.is_deleted ? 'Deleted' : 'Active'}</td>

                  <td>
                    {/* Open "View Result" modal */}
                    <button
                      disabled={r.is_deleted === true}
                      onClick={() => openViewResultModal(r.result_id)}
                    >
                      View Result
                    </button>
                    {/* Open "Delete Result" modal */}
                    <button onClick={() => openDeleteResultModal(r)}>
                      {r.is_deleted ? 'Restore' : 'Delete'}
                    </button>
                    {/* Open "Update Result" modal */}
                    {!r.is_deleted && r.TestType.test_type_name === 'hematology' && (
                      <button onClick={() => openUpdateModal(r)}>Update</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {/* ========================================================
           Toggle Delete MODAL (only when open)
        ======================================================== */}
      <ViewResultModal
        isOpen={isViewResultItemOpen}
        resultId={selectedResultId}
        onClose={() => closeViewResultItemModal(false)}
      />
      <DeleteResultModal
        isOpen={isDeleteResultItemOpen}
        selectedResult={selectedResult}
        onSubmit={handleToggleDelete}
        onClose={() => closeDeleteResultItemModal(false)}
      />
      {isUpdateModalOpen ? (
        <UpdateHematologyModal
          isOpen={isUpdateModalOpen}
          selectedResult={selectedResult}
          onClose={closeUpdateModal}
          onUpdated={handleUpdateSuccess}
        />
      ) : null}
    </div>
  );
}

export default Result;
