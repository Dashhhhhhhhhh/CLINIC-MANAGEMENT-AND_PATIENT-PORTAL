// src/pages/Patients.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllPatient, toggleActivePatient } from '../api/patients';

import '../components/CSS/shared-ui.css';
import '../components/CSS/PatientPage.css';
import '../components/CSS/PatientTable.css';
import '../components/CSS/Patients.css';

import CreatePatientModal from '../components/modals/Patients/CreatePatientModal';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [flashPatientId, setFlashPatientId] = useState(null);

  const [toggleId, setTogglingId] = useState(null);

  const navigate = useNavigate();

  // Debounce searchTerm -> debouncedSearch
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page on new search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Flash row cleanup
  useEffect(() => {
    if (!flashPatientId) return;
    const t = setTimeout(() => setFlashPatientId(null), 1200);
    return () => clearTimeout(t);
  }, [flashPatientId]);

  // Fetch patients list
  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsPatientLoading(true);
      setError(null);

      try {
        const result = await getAllPatient({
          search: debouncedSearch,
          page,
          limit,
        });

        if (!isMounted) return;

        if (result.success) {
          // Expecting: { success: true, meta: {...}, data: [...] }
          setPatients(Array.isArray(result.data) ? result.data : []);
          setMeta(result.meta ?? null);
        } else {
          setError({ message: result.message || 'Failed to fetch patients' });
        }
      } catch (err) {
        if (!isMounted) return;

        const msg =
          err.response?.data?.message || (err.request ? 'No response from server' : err.message);

        setError({ message: msg });
      } finally {
        if (isMounted) setIsPatientLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, limit, refreshKey]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setMeta(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setMeta(null);
  };

  const openCreatePatientModal = () => setIsCreateOpen(true);
  const closeCreatePatientModal = () => setIsCreateOpen(false);

  const handleToggleActive = async (e, patient) => {
    e.stopPropagation();
    if (!patient?.patient_id) return;

    const nextActive = !patient.active;

    setTogglingId(patient.patient_id);
    setError(null);

    try {
      const result = await toggleActivePatient(patient.patient_id, nextActive);

      if (result.success) {
        setFlashPatientId(patient.patient_id);
        setRefreshKey(k => k + 1);
      } else {
        setError({ message: result.message || 'Failed to update patient status' });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || (err.request ? 'No response from server' : err.message);

      setError({ message: msg });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="patients-page__table data-card">
      <div className="page-header">
        <div className="page-header__left">
          <label htmlFor="patient-search">Search Patient</label>
          <input
            id="patient-search"
            type="text"
            placeholder="Search patient name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="page-header__right">
          <button onClick={openCreatePatientModal}>Add Patient</button>
          <button onClick={handleClearSearch} disabled={!searchTerm}>
            Clear
          </button>
        </div>
      </div>

      <table className="table-ui patients-table">
        <thead>
          <tr>
            <th className="table-ui__th">Patient Name</th>
            <th className="table-ui__th">Contact Number</th>
            <th className="table-ui__th">Status</th>
          </tr>
        </thead>
        <tbody>
          {isPatientLoading ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                {error.message}
              </td>
            </tr>
          ) : meta && meta.total === 0 ? (
            <tr>
              <td className="table-ui__td" colSpan={3}>
                No result yet
              </td>
            </tr>
          ) : (
            (patients ?? []).map(p => (
              <tr
                key={p.patient_id}
                className={`table-ui__row ${
                  flashPatientId === p.patient_id ? 'table-ui__row--flash' : ''
                }`}
              >
                <td className="table-ui__td">
                  <span
                    className="patients-table__name-link"
                    onClick={() => navigate(`/dashboard/patients/${p.patient_id}`)}
                  >
                    {p.first_name} {p.last_name}
                  </span>
                </td>

                <td className="table-ui__td">{p.contact_number}</td>

                <td className="table-ui__td patients-table__status-cell">
                  <span
                    className={`status-badge ${
                      p.active ? 'status-badge--active' : 'status-badge--inactive'
                    }`}
                  >
                    {p.active ? 'Active' : 'Archived'}
                  </span>

                  <button
                    type="button"
                    className="switch-btn"
                    aria-pressed={!!p.active}
                    disabled={isPatientLoading || toggleId === p.patient_id}
                    onClick={e => handleToggleActive(e, p)}
                    title={p.active ? 'Archive patient' : 'Activate patient'}
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

      {meta && meta.total > 0 && (
        <div className="patients-page__pagination">
          <button
            disabled={isPatientLoading || !!error || !meta?.hasPrevPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <button
            disabled={isPatientLoading || !!error || !meta?.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>

          <p>
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </p>
        </div>
      )}

      {isCreateOpen && (
        <CreatePatientModal
          isOpen={isCreateOpen}
          onClose={closeCreatePatientModal}
          onCreated={newPatient => {
            const id = newPatient?.patient_id;
            if (id) setFlashPatientId(id);
            setPage(1);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}

export default Patients;
