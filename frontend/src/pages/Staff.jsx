import { useState, useEffect } from 'react';

import { getAllStaff, toggleActiveStaff, getStaffById, getAvailablePosition } from '../api/staff';

import CreateStaffModal from '../components/modals/Staff/CreateStaffModal';
import EditStaffModal from '../components/modals/Staff/EditStaffModal';

import '../components/CSS/shared-ui.css';
import '../components/CSS/Staff.css';

function Staff() {
  // State Variables
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [isStaffLoading, setIsStaffLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const [flashStaffId, setFlashStaffId] = useState(null);
  const [togglingStaffId, setTogglingStaffId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset page on new search
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setPage(1);
    setMeta(null);
    setSelectedStaff(null);
    setSelectedStaffId(null);
  };

  useEffect(() => {
    if (!flashStaffId) return;

    const t = setTimeout(() => setFlashStaffId(null), 1200);
    return () => clearTimeout(t);
  }, [flashStaffId]);

  // Fetch Staff (Initial Load)
  useEffect(() => {
    let isMounted = true;

    const fetchStaffs = async () => {
      setIsStaffLoading(true);
      setError(null);

      try {
        const result = await getAllStaff({ search: debouncedSearch, page, limit });
        if (isMounted) {
          if (result.success) {
            setStaff(result.staff);
            setMeta(result.meta);
          } else {
            setError({ type: 'FETCH_FAILED', message: result.message });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError({ type: 'FETCH_FAILED', message: err.message });
        }
      } finally {
        if (isMounted) {
          setIsStaffLoading(false);
        }
      }
    };
    fetchStaffs();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, limit, refreshKey]);

  const handleToggleActive = async (e, staff) => {
    e.stopPropagation();

    if (!staff?.staff_id) return;

    const nextActive = !staff.active;

    setTogglingStaffId(staff.staff_id);
    setError(null);
    try {
      const result = await toggleActiveStaff(staff.staff_id, nextActive);

      if (result.success) {
        setFlashStaffId(staff.staff_id);
        setRefreshKey(k => k + 1);
      } else {
        setError({
          type: 'UPDATE_FAILED',
          message: result.message || 'Failed to update staff status',
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.request ? 'No response from server' : error.message);

      setError({ type: 'NETWORK_ERROR', message: msg });
    } finally {
      setTogglingStaffId(null);
    }
  };

  const fetchStaffById = async staff_id => {
    setIsDetailsLoading(true);
    try {
      const result = await getStaffById(staff_id);
      setSelectedStaff(result.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError({ type: 'FETCH_FAILED', message: 'Failed to fetch staff.' });
      setSelectedStaff(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleStaffUpdated = async updatedStaff => {
    setFlashStaffId(updatedStaff.staff_id);
    setRefreshKey(k => k + 1);

    if (selectedStaffId === updatedStaff.staff_id) {
      setSelectedStaff(updatedStaff);
    }

    await fetchStaffById(selectedStaffId);
  };

  const openCreateStaffModal = () => {
    setIsCreateOpen(true);
  };

  const closeCreateStaffModal = () => {
    setIsCreateOpen(false);
  };

  const handleClearSearch = e => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedStaff(null);
    setSelectedStaffId(null);
    setPage(1);
  };

  const openEditStaffModal = () => {
    if (!selectedStaff) return;
    setIsEditOpen(true);
    setError(null);
    setPage(1);
  };

  const closeEditStaffModal = () => {
    setIsEditOpen(false);
    setError(null);
  };

  const closeDetailsPanel = () => {
    setSelectedStaff(null);
    setSelectedStaffId(null);
  };

  return (
    <div className="staff-page__table data-card">
      <label htmlFor="staff-search">Search Staff</label>
      <input
        id="staff-search"
        type="text"
        placeholder="Search staff name..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button onClick={handleClearSearch} disabled={!searchTerm}>
        Clear
      </button>
      <button onClick={openCreateStaffModal}>Add Staff</button>
      <table className="table-ui staff-table">
        <thead>
          <tr>
            <th className="table-ui__th">Staff Name</th>
            <th className="table-ui__th">Contact Number</th>
            <th className="table-ui__th">Status</th>
          </tr>
        </thead>
        <tbody>
          {isStaffLoading ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                Loading..
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                {error.message ?? error}
              </td>
            </tr>
          ) : meta && meta.total === 0 ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                No result yet
              </td>
            </tr>
          ) : (
            staff.map(s => (
              <tr
                className={`table-ui__row ${
                  flashStaffId === s.staff_id ? 'table-ui__row--flash' : ''
                }`}
                key={s.staff_id}
              >
                <td className="table-ui__td">
                  <span
                    className="staff-table__name-link"
                    onClick={() => {
                      if (selectedStaffId === s.staff_id) {
                        setSelectedStaff(null);
                        setSelectedStaffId(null);
                      } else {
                        setSelectedStaffId(s.staff_id);
                        fetchStaffById(s.staff_id);
                      }
                    }}
                  >
                    {s.first_name} {s.last_name}
                  </span>
                </td>
                <td className="table-ui__td">{s.contact_number}</td>
                <td className="table-ui__td staff-table__status-cell">
                  <span
                    className={`status-badge ${
                      s.active ? 'status-badge--active' : 'status-badge--inactive'
                    }`}
                  >
                    {s.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    type="button"
                    className="switch-btn"
                    aria-pressed={!!s.active}
                    disabled={isStaffLoading || togglingStaffId === s.staff_id}
                    onClick={e => handleToggleActive(e, s)}
                    title={s.active ? 'Deactivate staff' : 'Activate staff'}
                  >
                    <span className="switch-track" />
                    <span className="switch-thumb" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* RIGHT: DETAILS PANEL */}
      <div className="details-panel">
        {isDetailsLoading ? (
          <p>Loading Staff details...</p>
        ) : selectedStaff ? (
          <>
            <h3>Staff Details</h3>
            <p>Employee Number: {selectedStaff.employee_number}</p>
            <p>Fist Name: {selectedStaff.first_name}</p>
            <p>Middle Initial: {selectedStaff.middle_initial}</p>
            <p>Last Name: {selectedStaff.last_name}</p>
            <p>Contact Number: {selectedStaff.contact_number}</p>
            <p>Position: {selectedStaff.position?.position_name ?? '-'}</p>
            <p>Status: {selectedStaff.active ? 'Active' : 'Inactive'}</p>

            <button className="btn btn--primary" onClick={openEditStaffModal}>
              Edit
            </button>
            <button className="btn btn--secondary" onClick={closeDetailsPanel}>
              Close
            </button>
          </>
        ) : (
          <p>Select a staff to view details</p>
        )}
      </div>
      {/* Pagination controls */}
      {meta && meta.total > 0 && (
        <div className="staff-page__pagination">
          <button
            disabled={isStaffLoading || error || !meta?.hasPrevPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            disabled={isStaffLoading || error || !meta?.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
          <p>
            Page {meta?.page ?? 1} of {meta?.totalPages ?? 0}
          </p>
        </div>
      )}
      {isCreateOpen && (
        <CreateStaffModal
          isOpen={isCreateOpen}
          onClose={closeCreateStaffModal}
          onCreated={newStaff => {
            const id = newStaff?.staff_id;
            if (id) {
              setFlashStaffId(id);
            }
            setPage(1);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
      <EditStaffModal
        isOpen={isEditOpen}
        onClose={closeEditStaffModal}
        staff={selectedStaff}
        onUpdated={handleStaffUpdated}
      />
    </div>
  );
}

export default Staff;
