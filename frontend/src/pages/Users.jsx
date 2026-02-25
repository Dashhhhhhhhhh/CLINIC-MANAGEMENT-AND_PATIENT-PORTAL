import { useState, useEffect } from 'react';
import {
  createUser,
  getAllUsers,
  getUsersById,
  getAllAvailableRole,
  toggleActiveUser,
} from '../api/users';

import '../components/CSS/shared-ui.css';
import '../components/CSS/UsersPage.css';

import CreateUserModal from '../components/modals/Users/CreateUserModal';
import EditUserModal from '../components/modals/Users/EditUserModal';

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [addUsers, setAddUsers] = useState({
    id: '',
    email: '',
    username: '',
    password: '',
    gender: '',
  });

  const resetForm = () => {
    setAddUsers({
      id: '',
      email: '',
      username: '',
      password: '',
      gender: '',
    });
  };

  const [selectedRole, setSelectedRole] = useState('');
  const [availableRole, setAvailableRole] = useState([]);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [flashUserId, setFlashUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toggleId, setTogglingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Debounce effect

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchUsers = async () => {
    setIsListLoading(true);
    setError(null);

    try {
      const params = {
        search: debouncedSearch,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (statusFilter === 'active') {
        params.active = true;
      } else if (statusFilter === 'inactive') {
        params.active = false;
      }
      // if statusFilter === 'all' -> don't add params.active

      if (roleFilter !== 'all') {
        params.role_id = roleFilter;
      }

      const result = await getAllUsers(params);

      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
        setMeta(result.meta);
      } else {
        setUsers([]);
        setMeta(null);
      }
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
        console.error('Backend error:', errorMessage);
      } else if (error.request) {
        errorMessage = 'No response from server';
        console.error('Network error:', errorMessage);
      } else {
        errorMessage = error.message;
        console.error('Unexpected error:', errorMessage);
      }

      setError({ message: errorMessage }); // (you were missing this in fetchUsers)
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, sortBy, sortOrder, statusFilter, roleFilter, refreshKey]);

  // ============================
  //  Fetch Available Roles
  // ============================

  useEffect(() => {
    const fetchAvaiableRoles = async () => {
      try {
        const result = await getAllAvailableRole();

        setAvailableRole(result.roles);
      } catch (error) {
        let errorMessage = '';

        if (error.response) {
          errorMessage = error.response.data?.message || 'Server error occurred';
          console.error('Backend error:', errorMessage);
        } else if (error.request) {
          errorMessage = 'No response from server';
          console.error('Network error:', errorMessage);
        } else {
          errorMessage = error.message;
          console.error('Unexpected error:', errorMessage);
        }

        setError({ message: errorMessage });
      }
    };

    fetchAvaiableRoles();
  }, []);

  // ============================
  //  HANDLE ADD USER
  // ============================

  const handleAddUsers = async e => {
    e.preventDefault();
    setIsCreateSubmitting(true);
    setSuccessMessage('');
    setError(null);

    try {
      const payload = {
        ...addUsers,
        role_id: selectedRole,
      };

      const result = await createUser(payload);

      if (result.success && result.data) {
        const newUserId = result.data.id;

        resetForm();

        setFlashUserId(newUserId);
        setSelectedUserId(newUserId);
        setSelectedUser(result.data);

        setSuccessMessage('User addsed successfully!');
        closeCreateUserModal();

        setPage(1);
        setRefreshKey(k => k + 1);
      } else {
        setError({ message: result.message || 'Failed to add user' });
      }
    } catch (error) {
      let errorMessage = '';

      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
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
      setIsCreateSubmitting(false);
    }
  };

  const fetchUserById = async id => {
    setIsDetailsLoading(true);
    try {
      const result = await getUsersById(id);
      setSelectedUser(result.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError({ message: 'failed to fetch user.' });
      setSelectedUser(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (!flashUserId) return; // guard clause: do nothing if null/undefined

    const t = setTimeout(() => setFlashUserId(null), 1200);

    return () => clearTimeout(t); // cleanup if flashUserId changes or component unmounts
  }, [flashUserId]);

  const handleUserUpdated = updatedUser => {
    // highlight the updated row
    setFlashUserId(updatedUser.id);

    // trigger a fresh fetch
    setRefreshKey(k => k + 1);

    // if the updated user is the one currently selected, update details immediately
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
  };

  const handleToggleActive = async (e, user) => {
    e.stopPropagation(); // IMPORTANT: prevent row click select/fetch
    console.log('TOGGLE CLICK', user.id, user.active);

    if (!user?.id) return;

    const nextActive = !user.active;

    setTogglingId(user.id);
    setError(null);

    try {
      // reuse same API as EditUserModal
      const result = await toggleActiveUser(user.id, nextActive);

      if (result.success) {
        setFlashUserId(user.id);
        setRefreshKey(k => k + 1);

        // keep details panel in sync if this is the selected row
        if (selectedUserId === user.id) {
          fetchUserById(user.id);
        }
      } else {
        setError({ message: result.message || 'Failed to update user status' });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.request ? 'No response from server' : error.message);

      setError({ message: msg });
    } finally {
      setTogglingId(null);
    }
  };

  const openCreateUserModal = () => {
    setIsCreateOpen(true);
    setError(null);
    setPage(1);
  };

  const closeCreateUserModal = () => {
    setIsCreateOpen(false);
    resetForm();
    setSelectedRole('');
    setError(null);
  };

  const openEditUserModal = () => {
    if (!selectedUser) return;
    setIsEditOpen(true);
    setError(null);
    setPage(1);
  };

  const closeEditUserModal = () => {
    setIsEditOpen(false);
    setError(null);
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setPage(1);
    setMeta(null);
  };

  const handleClearSearch = e => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  const handleStatusFilterChange = e => {
    setStatusFilter(e.target.value);
    setPage(1); // reset pagination
    setMeta(null); // optional but clean
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  const handleRoleFilterChange = e => {
    setRoleFilter(e.target.value);
    setPage(1);
    setMeta(null);
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  const closeDetailsPanel = () => {
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  return (
    <div>
      {/* Top action bar */}
      <div style={{ marginBottom: '12px' }}>
        <button
          className="btn btn--primary"
          onClick={openCreateUserModal}
          disabled={isCreateSubmitting}
        >
          Create User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search user name..."
        value={searchTerm}
        onChange={handleSearchChange}
        disabled={isListLoading}
      />
      <button onClick={handleClearSearch} disabled={!searchTerm}>
        Clear
      </button>

      <select
        value={statusFilter}
        onChange={handleStatusFilterChange}
        disabled={isListLoading} // disable only when loading
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={roleFilter}
        onChange={handleRoleFilterChange}
        disabled={isListLoading} // same fix here
      >
        <option value="all">All Roles</option>
        {availableRole.map(role => (
          <option key={role.role_id} value={role.role_id}>
            {role.role_name}
          </option>
        ))}
      </select>

      <h2>User List</h2>

      {/* MAIN LAYOUT */}
      <div className="users-layout">
        {/* LEFT: TABLE */}
        <div className="users-table">
          <table className="table-ui">
            <thead>
              <tr className="table-ui__row">
                <th className="table-ui__th">Username</th>
                <th className="table-ui__th">Role</th>
                <th className="table-ui__th">Status</th>
              </tr>
            </thead>

            {isListLoading ? (
              <tbody>
                <tr>
                  <td colSpan="3">Loading...</td>
                </tr>
              </tbody>
            ) : error ? (
              <tbody>
                <tr>
                  <td colSpan="3">{error.message ?? error}</td>
                </tr>
              </tbody>
            ) : users.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan="3">No results yet</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className={`table-ui__row ${
                      selectedUserId === user.id ? 'table-ui__row--active' : ''
                    } ${flashUserId === user.id ? 'table-ui__row--flash' : ''}`}
                    onClick={() => {
                      if (selectedUserId === user.id) {
                        setSelectedUser(null);
                        setSelectedUserId(null);
                      } else {
                        setSelectedUserId(user.id);
                        fetchUserById(user.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => {
                      if (e.key !== 'Enter') return;
                      setSelectedUserId(user.id);
                      fetchUserById(user.id);
                    }}
                  >
                    <td className="table-ui__td">{user.username}</td>
                    <td className="table-ui__td">{user.role?.role_name ?? '-'}</td>
                    <td className="table-ui__td">
                      <div className="user-status-cell">
                        <span
                          className={`status-badge ${user.active ? 'status-badge--active' : 'status-badge--inactive'}`}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>

                        <button
                          type="button"
                          className="switch-btn"
                          aria-pressed={!!user.active}
                          disabled={isListLoading || toggleId === user.id}
                          onClick={e => handleToggleActive(e, user)}
                          title={user.active ? 'Deactivate user' : 'Activate user'}
                        >
                          <span className="switch-track" />
                          <span className="switch-thumb" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {/* RIGHT: DETAILS PANEL */}
          <div className="details-panel">
            {isDetailsLoading ? (
              <p>Loading user details...</p>
            ) : selectedUser ? (
              <>
                <h3>User Details</h3>
                <p>ID: {selectedUser.id}</p>
                <p>Username: {selectedUser.username}</p>
                <p>Gender: {selectedUser.gender}</p>
                <p>Role: {selectedUser.role?.role_name ?? '-'}</p>
                <p>Status: {selectedUser.active ? 'Active' : 'Inactive'}</p>

                <button className="btn btn--primary" onClick={openEditUserModal}>
                  Edit
                </button>
                <button className="btn btn--secondary" onClick={closeDetailsPanel}>
                  Close
                </button>
              </>
            ) : (
              <p>Select a user to view details</p>
            )}
          </div>
        </div>

        {/* Pagination controls */}
        {meta && meta.total > 0 && (
          <div className="users-page__pagination">
            <button
              disabled={isListLoading || error || !meta?.hasPrevPage}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              disabled={isListLoading || error || !meta?.hasNextPage}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
            <p>
              Page {meta?.page ?? 1} of {meta?.totalPages ?? 0}
            </p>
          </div>
        )}
      </div>
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={closeCreateUserModal}
        onSubmit={handleAddUsers}
        addUsers={addUsers}
        setAddUsers={setAddUsers}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        availableRole={availableRole}
        loading={isCreateSubmitting}
        error={error}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={closeEditUserModal}
        user={selectedUser}
        onUpdated={handleUserUpdated}
        roles={availableRole}
      />
    </div>
  );
}

export default Users;
