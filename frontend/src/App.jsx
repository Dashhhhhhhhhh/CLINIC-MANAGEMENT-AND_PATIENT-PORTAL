import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './routes/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import Users from './pages/Users';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff';
import Patients from './pages/Patients';
import Billing from './pages/Billing';
import BillingService from './pages/Billing_service';
import BillingItem from './pages/Billing_item';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<DashboardLayout />} /> */}
        {/* Protected dashboard section */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes under DashboardLayout */}
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="patients" element={<Patients />} />
          <Route path="billing" element={<Billing />} />
          <Route path="billing_service" element={<BillingService />} />
          <Route path="billing/:billing_id/items" element={<BillingItem />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
