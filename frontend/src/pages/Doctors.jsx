import { useState, useEffect } from 'react';

import { getAllDoctors, getDoctorById, toggleActiveDoctor } from '../api/doctors';

import CreateDoctorModal from '../components/modals/Doctors/CreateDoctorModal';
import EditDoctorModal from '../components/modals/Doctors/EditDoctorModal';

import '../components/CSS/shared-ui.css';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const [flashDoctorId, setFlashDoctorId] = useState(null);
  const [togglineDoctorId, setTogglingDoctorId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

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
    setSelectedDoctor(null);
    setSelectedDoctorId(null);
  };

  useEffect(() => {
    if (!flashDoctorId) return;

    const t = setTimeout(() => setFlashDoctorId(null), 1200);
    return () => clearTimeout(t);
  }, [flashDoctorId]);

  const handleToggleActive = async (e, doctors) => {
    e.stopPropagation();

    if (!doctors?.doctor_id) return;

    const nextActive = !doctors.active;

    setTogglingDoctorId(doctors.doctor_id);
    setError(null);
    try {
      const result = await toggleActiveDoctor(doctors.doctor_id, nextActive);

      if (result.success) {
        setFlashDoctorId(doctors.doctor_id);
        setRefreshKey(k => k + 1);
      } else {
        setError({
          type: 'UPDATE_FAILED',
          message: result.message || 'Failed to update doctor status',
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.request ? 'No response from server' : error.message);

      setError({ type: 'NETWORK_ERROR', message: msg });
    } finally {
      setTogglingDoctorId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      setIsDoctorLoading(true);
      setError(null);

      try {
        const result = await getAllDoctors({ search: debouncedSearch, page, limit });
        if (isMounted) {
          if (result.success) {
            setDoctors(Array.isArray(result.data) ? result.data : []);
            setMeta(result.meta);
          } else {
            setError({ type: 'FETCH FAILED', message: result.message });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError({ type: 'FETCH_FAILED', message: err.message });
        }
      } finally {
        if (isMounted) {
          setIsDoctorLoading(false);
        }
      }
    };
    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, limit, refreshKey]);

  const fetchDoctorById = async doctor_id => {
    setIsDetailsLoading(true);

    try {
      const result = await getDoctorById(doctor_id);

      setSelectedDoctor(result.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch doctor:', err);
      setError({ type: 'FETCH_FAILED', message: 'Failed to fetch doctor.' });
      setSelectedDoctor(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleDoctorUpdated = async updateDoctor => {
    setFlashDoctorId(updateDoctor.doctor_id);
    setRefreshKey(k => k + 1);

    if (selectedDoctorId === updateDoctor.doctor_id) {
      setSelectedDoctor(updateDoctor);
    }

    await fetchDoctorById(selectedDoctorId);
  };

  const openCreateDoctorModal = () => {
    setIsCreateOpen(true);
  };

  const closeCreateDoctorModal = () => {
    setIsCreateOpen(false);
  };

  const handleClearSearch = e => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedDoctor(null);
    setSelectedDoctorId(null);
    setPage(1);
  };

  const openEditDoctorModal = () => {
    if (!selectedDoctor) return;
    setIsEditOpen(true);
    setError(null);
    setPage(1);
  };

  const closeEditDoctorModal = () => {
    setIsEditOpen(false);
    setError(null);
  };

  const closeDetailsPanel = () => {
    setSelectedDoctor(null);
    setSelectedDoctorId(null);
  };

  return (
    <div className="doctor-page__table data-card">
      <label htmlFor="doctor-search">Search Doctor</label>
      <input
        id="doctor-search"
        type="text"
        placeholder="Search doctor's name..."
        value={searchTerm}
        onChange={handleSearchChange}
      ></input>
      <button onClick={handleClearSearch} disabled={!searchTerm}>
        Clear
      </button>
      <button onClick={openCreateDoctorModal}>Add Doctor</button>
      <table className="table-ui doctor-table">
        <thead>
          <tr>
            <th className="table-ui__th">Doctor's Name</th>
            <th className="table-ui__th">Contact Number</th>
            <th className="table-ui__th">Status</th>
          </tr>
        </thead>
        <tbody>
          {isDoctorLoading ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                Loading...
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
            doctors.map(d => (
              <tr
                className={`table-ui__row ${
                  flashDoctorId === d.doctor_id ? 'table-ui__row--flash' : ''
                }`}
                key={d.doctor_id}
              >
                <td className="table-ui__td">
                  <span
                    className="doctor-table__name-link"
                    onClick={() => {
                      if (selectedDoctorId === d.doctor_id) {
                        setSelectedDoctor(null);
                        setSelectedDoctorId(null);
                      } else {
                        setSelectedDoctorId(d.doctor_id);
                        fetchDoctorById(d.doctor_id);
                      }
                    }}
                  >
                    {d.first_name} {d.last_name}
                  </span>
                </td>
                <td className="table-ui__td">{d.contact_number}</td>
                <td className="table-ui__td doctor-table__status-cell">
                  <span
                    className={`status-badge ${
                      d.active ? 'status-badge--active' : 'status-badge--inactive'
                    }`}
                  >
                    {d.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    type="button"
                    className="switch-btn"
                    aria-pressed={!!d.active}
                    disabled={isDoctorLoading || togglineDoctorId === d.doctor_id}
                    onClick={e => handleToggleActive(e, d)}
                    title={d.active ? 'Deactivate doctor' : 'Activate doctor'}
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
          <p>Loading Doctor details...</p>
        ) : selectedDoctor ? (
          <>
            <h3>Staff Details</h3>
            <p>License Number: {selectedDoctor.license_number}</p>
            <p>Fist Name: {selectedDoctor.first_name}</p>
            <p>Middle Initial: {selectedDoctor.middle_initial}</p>
            <p>Last Name: {selectedDoctor.last_name}</p>
            <p>Contact Number: {selectedDoctor.contact_number}</p>
            <p>Position: {selectedDoctor.specialization?.specialization_name ?? '-'}</p>
            <p>Status: {selectedDoctor.active ? 'Active' : 'Inactive'}</p>

            <button className="btn btn--primary" onClick={openEditDoctorModal}>
              Edit
            </button>
            <button className="btn btn--secondary" onClick={closeDetailsPanel}>
              Close
            </button>
          </>
        ) : (
          <p>Select a doctor to view details</p>
        )}
      </div>
      {/* Pagination controls */}
      {meta && meta.total > 0 && (
        <div className="staff-page__pagination">
          <button
            disabled={isDoctorLoading || error || !meta?.hasPrevPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            disabled={isDoctorLoading || error || !meta?.hasNextPage}
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
        <CreateDoctorModal
          isOpen={isCreateOpen}
          onClose={closeCreateDoctorModal}
          onCreated={newDoctor => {
            const id = newDoctor?.doctor_id;
            if (id) {
              setFlashDoctorId(id);
            }
            setPage(1);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
      <EditDoctorModal
        isOpen={isEditOpen}
        onClose={closeEditDoctorModal}
        doctor={selectedDoctor}
        onUpdated={handleDoctorUpdated}
      />
    </div>
  );
}

export default Doctors;
