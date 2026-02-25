import { useState, useEffect } from 'react';
import { getWorklistResults, getResultById } from '../api/results';

import ViewResultModal from '../components/modals/Results/ViewResultModal';

function ClinicalWorklist() {
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('Pending');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  const statuses = ['Pending', 'Reviewed', 'Approved', 'Completed'];

  function formatDay(iso) {
    if (!iso) return '-';

    const date = new Date(iso);

    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short', // "Nov"
      day: 'numeric', // "24"
      year: 'numeric', // "2025"
    });
  }

  function handleStatusChange(newStatus) {
    setStatus(newStatus);
    setPage(1);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchResult = async () => {
      try {
        const result = await getWorklistResults({ status, page, limit });
        if (result.success) {
          setResults(result.results);
          setMeta(result.meta);
        } else {
          setError(result.message || 'Failed to load worklist result.');
        }
      } catch (err) {
        setError('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [status, page, limit]);

  const handleView = async resultId => {
    setSelectedResult(null);
    try {
      setIsViewModalOpen(true);
      setViewLoading(true);

      const result = await getResultById(resultId);

      setSelectedResult(result.data);
      console.log(result.data.TestType, result.data.test_record);
    } catch (err) {
      console.error('Failed to fetch result:', err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setSelectedResult(null);
    setIsViewModalOpen(false);
  };

  return (
    <div>
      <h2>Worklist</h2>

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            style={{
              fontWeight: status === s ? 'bold' : 'normal',
              borderBottom: status === s ? '2px solid blue' : 'none',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table with conditional rendering */}
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Test Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5">Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="5">{error.message ?? error}</td>
            </tr>
          ) : results.length === 0 ? (
            <tr>
              <td colSpan="5">No worklist item found.</td>
            </tr>
          ) : (
            results.map(r => (
              <tr key={r.result_id}>
                <td>
                  {r.patient?.first_name} {r.patient?.last_name}
                </td>
                <td>{r.TestType?.test_type_name}</td>
                <td>{formatDay(r.created_at)}</td>
                <td>{r.status ?? '-'}</td>
                <td>...</td>
                <td>
                  <button onClick={() => handleView(r.result_id)}> View </button>{' '}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {meta?.totalPages > 1 && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            disabled={loading || !meta?.hasPrevPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </span>

          <button disabled={loading || !meta?.hasNextPage} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}
      <ViewResultModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        result={selectedResult}
        loading={viewLoading}
      />
    </div>
  );
}

export default ClinicalWorklist;
