import { useState, useEffect } from 'react';

import { getResultsList, getResultById, deleteResult } from '../api/results';
import { getAllTestTypes } from '../api/testTypes';

import ViewResultModal from '../components/modals/Results/ViewResultModal';
import DeleteResultModal from '../components/modals/Results/DeleteResultModal';
import UpdateResultModal from '../components/modals/Results/update/UpdateResultModal';
import CreateResultModal from '../components/modals/Results/CreateResultModal.jsx';

import '../components/CSS/shared-ui.css';
function Result() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [testTypeId, setTestTypeId] = useState('');
  const [testTypes, setTestTypes] = useState([]);
  const [isTestypeLoading, setIsTestTypeLoading] = useState(false);

  const [selectedResult, setSelectedResult] = useState(null);
  const [isDeleteResultItemOpen, setIsDeleteResultItemOpen] = useState(false);

  const [isViewResultItemOpen, setIsViewResultItemOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState('DESC');

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setPage(1);
    setMeta(null);
  };

  const handleTestTypeChange = value => {
    setTestTypeId(value);
    setPage(1);
    setMeta(null);
  };

  const buildParams = () => {
    const params = {
      page,
      limit,
    };

    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.search = debouncedSearch.trim();
    }

    if (testTypeId) {
      params.test_type_id = testTypeId;
    }

    return params;
  };

  const fetchResult = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getResultsList(buildParams());
      if (result.success) {
        setResults(result.results);
        setMeta(result.meta);
      } else {
        setError({ type: 'FETCH_FAILED', message: result.message });
      }
    } catch (error) {
      setError({ type: 'FETCH_ERROR', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [debouncedSearch, page, limit, testTypeId]);

  useEffect(() => {
    let isMounted = true;

    const fetchTestTypes = async () => {
      setIsTestTypeLoading(true);
      setError(null);

      console.log('testTypes state:', testTypes);

      try {
        const result = await getAllTestTypes();
        console.log('Fetched test types:', result);

        if (isMounted) {
          setTestTypes(result.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch test types:', err);
        if (isMounted) {
          setError({ type: 'FETCH_FAILED', message: 'Failed to fetch test types.' });
          setTestTypes([]);
        }
      } finally {
        if (isMounted) {
          setIsTestTypeLoading(false);
        }
      }
    };

    fetchTestTypes();

    return () => {
      isMounted = false;
    };
  }, []);

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

  function closeViewResultItemModal() {
    setIsViewResultItemOpen(false);
    setSelectedResult(null);
  }

  async function openViewResultModal(result_id) {
    setError(null);
    setViewLoading(true);
    try {
      const result = await getResultById(result_id);

      if (result.success) {
        setSelectedResult(result.data);
        setIsViewResultItemOpen(true);
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
  }

  function openDeleteResultModal(result) {
    setSelectedResult(result);
    setIsDeleteResultItemOpen(true);
  }

  function closeDeleteResultItemModal() {
    setIsDeleteResultItemOpen(false);
    setSelectedResult(null);
  }

  const openUpdateModal = async row => {
    try {
      const rest = await getResultById(row.result_id);

      setSelectedResult(rest.data);
      setIsUpdateModalOpen(true);
    } catch (err) {
      console.error('Failed to load full result', err);
    }
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedResult(null);
  };

  function handleUpdateSuccess() {
    fetchResult();
    closeUpdateModal();
  }

  return (
    <div className="page">
      {/* ================= PAGE HEADER ================= */}
      <div className="page__header">
        <h2 className="page__title">Result Lists</h2>

        <button className="btn btn--primary" onClick={() => setIsCreateOpen(true)}>
          Create Result
        </button>
      </div>

      {/* ================= FILTERS ROW ================= */}
      <div className="page__controls">
        {/* Test Type Filter */}
        <div className="control">
          <label className="control__label">Test Type</label>
          <select
            className="control__select"
            value={testTypeId}
            onChange={e => handleTestTypeChange(e.target.value)}
            disabled={isTestypeLoading}
          >
            <option value="">{isTestypeLoading ? 'Loading test types…' : 'All test types'}</option>

            {testTypes.map(type => (
              <option key={type.test_type_id} value={type.test_type_id}>
                {type.test_type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="control control--grow">
          <label className="control__label">Search</label>
          <input
            className="control__input"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search patient or test type…"
          />
        </div>

        {/* Sort by Date */}
        <div className="control">
          <label className="control__label">Sort</label>
          <select
            className="control__select"
            value={sortOrder}
            onChange={e => {
              setSortOrder(e.target.value);
              setPage(1);
              setMeta(null);
            }}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="control control--button">
          <button
            className="btn btn--secondary"
            disabled={loading}
            onClick={() => {
              setSearchTerm('');
              setTestTypeId('');
              setSortOrder('DESC');
              setPage(1);
              setMeta(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="table-card">
        <table className="table-ui">
          <thead className="table-ui__thead">
            <tr className="table-ui__tr">
              <th className="table-ui__th">Result ID</th>
              <th className="table-ui__th">Patient</th>
              <th className="table-ui__th">Result Type</th>
              <th className="table-ui__th">Created By</th>
              <th className="table-ui__th">Status</th>
              <th className="table-ui__th table-ui__th--actions">Actions</th>
            </tr>
          </thead>

          <tbody className="table-ui__tbody">
            {results.length === 0 ? (
              <tr className="table-ui__tr table-ui__tr--empty">
                <td colSpan={6} className="table-ui__td table-ui__td--empty">
                  No results to show
                </td>
              </tr>
            ) : (
              results.map(r => {
                const patientName = [r.patient?.first_name, r.patient?.last_name]
                  .filter(n => n && n.trim() !== '')
                  .join(' ');

                const displayPatient = patientName.length > 0 ? patientName : 'Patient unavailable';

                return (
                  <tr key={r.result_id} className="table-ui__tr">
                    <td className="table-ui__td">{r.result_id}</td>

                    <td className="table-ui__td">
                      <span className="table-ui__primary">{displayPatient}</span>
                    </td>

                    <td className="table-ui__td">
                      {r.TestType ? r.TestType.test_type_name : 'Test type unavailable'}
                    </td>

                    <td className="table-ui__td">{r.created_by}</td>

                    <td className="table-ui__td">
                      <span
                        className={`status-badge ${
                          r.is_deleted ? 'status-badge--deleted' : 'status-badge--active'
                        }`}
                      >
                        {r.is_deleted ? 'Deleted' : 'Active'}
                      </span>
                    </td>

                    <td className="table-ui__td table-ui__td--actions">
                      <div className="table-actions">
                        <button
                          className="btn btn--ghost"
                          disabled={r.is_deleted}
                          onClick={() => openViewResultModal(r.result_id)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn--danger"
                          onClick={() => openDeleteResultModal(r)}
                        >
                          {r.is_deleted ? 'Restore' : 'Delete'}
                        </button>

                        {!r.is_deleted && r.TestType?.test_type_name === 'hematology' && (
                          <button className="btn btn--primary" onClick={() => openUpdateModal(r)}>
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {meta && meta.total > 0 && (
        <div className="table-ui__pagination">
          <button
            className="btn btn--secondary"
            disabled={loading || error || !meta?.hasPrevPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span className="pagination__info">
            Page {meta?.page ?? 1} of {meta?.totalPages ?? 0}
          </span>

          <button
            className="btn btn--secondary"
            disabled={loading || error || !meta?.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* ================= MODALS ================= */}
      <ViewResultModal
        isOpen={isViewResultItemOpen}
        onClose={closeViewResultItemModal}
        result={selectedResult}
        loading={viewLoading}
      />

      <DeleteResultModal
        isOpen={isDeleteResultItemOpen}
        selectedResult={selectedResult}
        onSubmit={handleToggleDelete}
        onClose={() => closeDeleteResultItemModal(false)}
      />

      {isUpdateModalOpen && selectedResult && (
        <UpdateResultModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          onSuccess={handleUpdateSuccess}
          testRecord={selectedResult?.test_record}
          recordId={selectedResult?.test_record_id}
          testType={selectedResult?.TestType?.test_type_name}
        />
      )}
      {isCreateOpen && (
        <CreateResultModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}

export default Result;
