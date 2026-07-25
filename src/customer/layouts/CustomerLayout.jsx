import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaDesktop,
  FaExclamationTriangle,
  FaUser,
  FaHeadset,
  FaSignOutAlt,
  FaShieldAlt,
  FaHome
} from 'react-icons/fa';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div className="container-fluid px-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="d-flex align-items-center justify-content-between" style={{ height: '68px' }}>
            {/* Logo & Portal Badge */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/customer/dashboard')}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <FaShieldAlt />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    DeskGuard
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Customer Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="d-none d-md-flex align-items-center gap-1">
              {[
                { to: '/customer/dashboard', label: 'Dashboard', icon: <FaHome /> },
                { to: '/customer/systems', label: 'My Systems', icon: <FaDesktop /> },
                { to: '/customer/alerts', label: 'Alerts', icon: <FaExclamationTriangle /> },
                { to: '/customer/profile', label: 'Profile', icon: <FaUser /> },
                { to: '/customer/support', label: 'Support', icon: <FaHeadset /> }
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    color: isActive ? '#2563eb' : '#64748b',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent'
                  })}
                >
                  <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Customer User Info & Logout */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-sm-flex flex-column text-end">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {user?.name || user?.customer_name || 'AMC Customer'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                  {user?.mobileNumber || user?.phone || user?.email || '9876543210'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <FaSignOutAlt />
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="d-flex d-md-none border-top px-3 py-2 justify-content-around" style={{ backgroundColor: '#ffffff', overflowX: 'auto' }}>
          {[
            { to: '/customer/dashboard', label: 'Dashboard', icon: <FaHome /> },
            { to: '/customer/systems', label: 'Systems', icon: <FaDesktop /> },
            { to: '/customer/alerts', label: 'Alerts', icon: <FaExclamationTriangle /> },
            { to: '/customer/profile', label: 'Profile', icon: <FaUser /> },
            { to: '/customer/support', label: 'Support', icon: <FaHeadset /> }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#64748b'
              })}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Page Area */}
      <main style={{ flex: 1, padding: '24px 16px' }}>
        <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Clean Customer Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container-fluid d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <span>© {new Date().getFullYear()} DeskGuard Customer Self-Service Portal. All rights reserved.</span>
          <span>AMC System Support Line: <strong>+91 1800-123-4567</strong></span>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
