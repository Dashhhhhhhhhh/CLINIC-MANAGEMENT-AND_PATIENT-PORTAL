import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getPatientResultHistory, getResultById } from '../api/results';

import '../components/CSS/PatientResultHistory.css';
import ViewResultModal from '../components/modals/Results/ViewResultModal';

function formatDay(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short', // "Nov"
    day: 'numeric', // "24"
    year: 'numeric', // "2025"
  });
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric', // 2
    minute: '2-digit', // 19
    hour12: true, // AM/PM
  });
}

function groupByDay(results) {
  const groups = {};

  for (const r of results) {
    const dayKey = formatDay(r.created_at); // e.g. "Nov 24, 2025"

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(r);
  }

  // Convert object into array of { day, items }
  return Object.entries(groups).map(([day, items]) => ({
    day,
    items,
  }));
}

function PatientResultHistory() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortOrder, setSortOrder] = useState('desc');

  const [selectedResult, setSelectedResult] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [meta, setMeta] = useState(null);

  const grouped = groupByDay(history);

  useEffect(() => {
    setPage(1);
    setHistory([]);
    setError(null);
    setMeta(null);
  }, [patientId, sortOrder]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchResult = async () => {
      try {
        if (!patientId) return;

        const result = await getPatientResultHistory(patientId, { page, limit, sortOrder });

        if (result.success) {
          setHistory(result.results);
          setMeta(result.meta);
        } else {
          setError(result.message || 'Failed to load patient history');
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
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [patientId, page, limit, sortOrder]);

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
        setError({ message: result.message || 'Result not found ' });
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

  return (
    <div>
      <h2>Clinical History</h2>
      <button onClick={() => navigate(`/dashboard/patients/${patientId}`)}> Back </button>
      {/* Filters bar */}
      <div>
        <div className="patient-history-container">
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="desc">New</option>
            <option value="asc">Old</option>
          </select>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error.message ?? error}</p>
        ) : meta && meta.total === 0 ? (
          <p>No results yet</p>
        ) : (
          // timeline render goes here
          grouped.map(dayGroup => (
            <div key={dayGroup.day} className="patient-history-day-group">
              <h3 className="patient-history-day">{dayGroup.day}</h3>
              <div className="patient-history-items">
                {dayGroup.items.map(r => (
                  <div
                    className="patient-history-row"
                    key={r.result_id}
                    onClick={() => handleView(r.result_id)}
                  >
                    <div className="patient-history-left">
                      <span
                        className={`test-badge test-${(r.TestType?.test_type_name || '').toLowerCase()}`}
                      >
                        {r.TestType?.test_type_name}
                      </span>
                      <span className={`status-pill status-${(r.status || '').toLowerCase()}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="patient-history-meta">{formatTime(r.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
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
      </div>
      {isViewModalOpen && (
        <ViewResultModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          result={selectedResult}
          loading={viewLoading}
        />
      )}
    </div>
  );
}

export default PatientResultHistory;
