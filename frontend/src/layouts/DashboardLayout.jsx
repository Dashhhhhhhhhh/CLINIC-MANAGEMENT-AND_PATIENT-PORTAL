import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, padding: '10px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
