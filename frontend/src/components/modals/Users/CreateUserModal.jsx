import '../../CSS/shared-ui.css';

function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  addUsers,
  setAddUsers,
  selectedRole,
  setSelectedRole,
  availableRole,
  loading,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Create User</h2>
        {error?.message && <p className="error-text">{error.message}</p>}

        <form onSubmit={onSubmit}>
          <label>
            E-mail
            <input
              type="email"
              placeholder="Enter Email Address"
              value={addUsers.email}
              onChange={e => setAddUsers({ ...addUsers, email: e.target.value })}
              required
            />
          </label>

          <label>
            Username
            <input
              type="text"
              placeholder="Enter Username"
              value={addUsers.username}
              onChange={e => setAddUsers({ ...addUsers, username: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter Password"
              value={addUsers.password}
              onChange={e => setAddUsers({ ...addUsers, password: e.target.value })}
              required
            />
          </label>

          <div>
            <p>Gender</p>
            <label className="form-radio">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={addUsers.gender === 'male'}
                onChange={e => setAddUsers({ ...addUsers, gender: e.target.value })}
              />
              Male
            </label>
            <label className="form-radio">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={addUsers.gender === 'female'}
                onChange={e => setAddUsers({ ...addUsers, gender: e.target.value })}
              />
              Female
            </label>
          </div>

          <label className="form-select">
            Role
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} required>
              <option value="">--Select a Role--</option>
              {availableRole.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name} ({role.description})
                </option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn--muted" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;
