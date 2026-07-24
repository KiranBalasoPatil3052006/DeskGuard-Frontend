import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaShieldAlt,
  FaThLarge,
  FaDesktop,
  FaFileAlt,
  FaBell,
  FaUser,
  FaHeadset,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { path: '/customer', name: 'Dashboard', icon: <FaThLarge /> },
    { path: '/customer/systems', name: 'My Systems', icon: <FaDesktop /> },
    { path: '/customer/reports', name: 'Reports', icon: <FaFileAlt /> },
    { path: '/customer/alerts', name: 'Alerts', icon: <FaBell /> },
    { path: '/customer/profile', name: 'Profile', icon: <FaUser /> },
    { path: '/customer/support', name: 'Support', icon: <FaHeadset /> },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main, #f8fafc)' }}>
      {/* Customer Sidebar */}
      <div
        className={`bg-white border-end d-flex flex-column transition-all ${sidebarOpen ? 'px-3' : 'px-2'}`}
        style={{
          width: sidebarOpen ? '250px' : '70px',
          minWidth: sidebarOpen ? '250px' : '70px',
          transition: 'all 0.2s ease',
          zIndex: 100
        }}
      >
        {/* Header Logo */}
        <div className="d-flex align-items-center justify-content-between py-3 border-bottom mb-3">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div className="p-2 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center">
              <FaShieldAlt size={18} />
            </div>
            {sidebarOpen && (
              <div>
                <div className="fw-bold text-dark lh-1" style={{ fontSize: '1rem' }}>DeskGuard</div>
                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Customer Portal</div>
              </div>
            )}
          </div>
          <button
            className="btn btn-link text-muted p-1 border-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="nav nav-pills flex-column gap-1 flex-grow-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/customer' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 fw-semibold ${isActive ? 'active bg-primary text-white shadow-sm' : 'text-secondary'}`}
                style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                title={!sidebarOpen ? item.name : ''}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="border-top py-3 mt-auto">
          {sidebarOpen && (
            <div className="mb-2 px-2">
              <div className="fw-bold text-dark small text-truncate">{user?.name || 'Customer User'}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user?.mobileNumber || user?.phone || 'Verified Customer'}</div>
            </div>
          )}
          <button
            className="btn btn-outline-danger w-100 btn-sm d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={handleLogout}
            style={{ borderRadius: '8px' }}
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between shadow-xs">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-3 py-1 rounded-pill fw-bold small">
              READ-ONLY CUSTOMER MONITORING
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="small text-muted d-none d-sm-inline">
              Welcome, <strong>{user?.name || 'Customer'}</strong>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
