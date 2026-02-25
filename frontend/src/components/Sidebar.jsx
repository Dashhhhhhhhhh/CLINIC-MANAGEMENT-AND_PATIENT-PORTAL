import { NavLink } from 'react-router-dom';
import '../components/CSS/Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Dashboard</h3>

      {/* OPERATIONS */}
      <h4 className="sidebar-section">Operations</h4>
      <ul className="sidebar-list">
        <li>
          <NavLink to="/dashboard/ClinicalWorklist">Clinical Worklist</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/patients">Patients</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/results">Results</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/billing">Billing</NavLink>
        </li>
      </ul>

      {/* MANAGEMENT */}
      <h4 className="sidebar-section">Management</h4>
      <ul className="sidebar-list">
        <li>
          <NavLink to="/dashboard/users">Users</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/staff">Staff</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/doctors">Doctors</NavLink>
        </li>
      </ul>

      {/* SYSTEM */}
      <h4 className="sidebar-section">System</h4>
      <ul className="sidebar-list">
        <li>
          <NavLink to="/dashboard/billing_service">Services</NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;

/* 
/Not now — just awareness:

icons per item

collapsible sections

dark mode theme

sidebar collapse button */

/* 
⚠️ What to adjust (small, but important polish)

These are not redesigns — just refinements.

🔧 1. Sidebar “Dashboard” label

Right now, “Dashboard” at the very top looks like a section title, not a link.

Recommended tweak (very small):

Either:

make “Dashboard” clickable

or visually treat it like the other section headers (smaller, muted)

Why:

Users expect “Dashboard” to be a destination

Consistency matters

🔧 2. Section spacing (micro-tweak)

Add slightly more vertical space between:

OPERATIONS → MANAGEMENT

MANAGEMENT → SYSTEM

This helps scanning and reduces cognitive load.

Think: breathing room, not padding overload.

🔧 3. Worklist error message placement

This line:

“Unexpected error occurred.”

Right now it appears in the same visual lane as content.

Professional behavior:

Show errors as:

a muted alert box

or inline message below filters

Not as table content

This is more UX than styling — we’ll clean it when we refine Worklist. */
