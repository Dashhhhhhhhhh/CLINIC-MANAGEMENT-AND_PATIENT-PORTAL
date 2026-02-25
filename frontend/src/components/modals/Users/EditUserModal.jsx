import { useState, useEffect } from 'react';

import { updateUser } from '../../../api/users';

function EditUserModal({ isOpen, onClose, user, onUpdated, roles }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const initialFormData = {
    username: '',
    email: '',
    gender: '',
    role_id: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setSaving(false);
      setError(null);
      return;
    }

    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        role_id: user.role_id || user.role?.role_id || '',
      });
    }
  }, [isOpen, user]);

  const handleSubmitEdit = async e => {
    e.preventDefault();
    setSaving(true);

    setError(null);

    try {
      if (!user?.id) return;

      const result = await updateUser(user.id, formData);
      if (result.success && result.data) {
        onUpdated(result.data);
        onClose();
      } else {
        setError({ message: result.message || 'Update failed' });
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
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Edit User</h2>
        {error && <p className="error-text">{error.message}</p>}

        <form onSubmit={handleSubmitEdit}>
          <p>Username</p>
          <input
            type="text"
            placeholder="Enter Username"
            value={formData.username || ''}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
          />
          <p>E-Mail</p>
          <input
            type="email"
            placeholder="Enter Email"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />

          <label className="form-radio">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={e =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
            />
            Male
          </label>

          <label className="form-radio">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={e =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
            />
            Female
          </label>

          <label className="form-select">
            Role
            <select
              value={formData.role_id}
              onChange={e =>
                setFormData({
                  ...formData,
                  role_id: e.target.value,
                })
              }
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="btn btn--muted" onClick={onClose}>
            Cancel
          </button>

          <div className="modal-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving..' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
