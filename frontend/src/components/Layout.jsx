import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="app-container">
      <div className="container py-4 d-flex gap-4">
        <main style={{ flex: 3 }}>
          <Outlet />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}