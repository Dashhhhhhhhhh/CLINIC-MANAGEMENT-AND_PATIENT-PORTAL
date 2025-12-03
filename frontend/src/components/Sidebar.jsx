import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{ width: '200px', padding: '10px', background: '#f5f5f5' }}>
      <h3 style={{ marginBottom: '20px', color: 'black' }}>Dashboard</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/users">Users</NavLink>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/doctors">Doctors</NavLink>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/staff">Staff</NavLink>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/patients">Patients</NavLink>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/billing">Billing</NavLink>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <NavLink to="/dashboard/billing_service">Billing Service</NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
