import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaThLarge, 
  FaLaptop, 
  FaUsers, 
  FaFileAlt, 
  FaBell, 
  FaCog, 
  FaUserPlus,
  FaShieldAlt,
  FaChevronDown,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || '';
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('settings_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('settings_theme', theme);
  }, [theme]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isCustomer = (role || '').toLowerCase() === 'customer';

  const mainMenuItems = isCustomer ? [
    { path: '/customer', name: 'Customer Portal', icon: <FaThLarge /> },
    { path: '/machines', name: 'My Machines', icon: <FaLaptop /> },
    { path: '/reports', name: 'My Reports', icon: <FaFileAlt /> },
    { path: '/alerts', name: 'My Alerts', icon: <FaBell /> },
  ] : [
    { path: '/dashboard', name: 'Dashboard', icon: <FaThLarge /> },
    { path: '/machines', name: 'Machines', icon: <FaLaptop /> },
    { path: '/agents', name: 'Agents', icon: <FaUsers /> },
    { path: '/reports', name: 'Reports', icon: <FaFileAlt /> },
    { path: '/alerts', name: 'Alerts', icon: <FaBell /> },
  ];

  const configMenuItems = isCustomer ? [
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ] : [
    { path: '/accounts', name: 'Accounts', icon: <FaUserPlus /> },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ];

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Logo & Toggle */}
      <div className="sidebar-header">
        {isOpen ? (
          <div className="sidebar-logo-group" style={{ flex: 1 }}>
            <div className="sidebar-logo-icon">
              <FaShieldAlt />
            </div>
            <div className="sidebar-logo-text-group">
              <div className="sidebar-logo-title">DeskGuard</div>
              <div className="sidebar-logo-subtitle">Monitoring Platform</div>
            </div>
            <button 
              onClick={onToggle}
              style={{
                background: 'none', border: 'none', padding: '6px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: '6px', marginLeft: 'auto',
                color: 'var(--dg-text-muted)', transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dg-bg-hover)'; e.currentTarget.style.color = 'var(--dg-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--dg-text-muted)'; }}
              title="Collapse sidebar"
            >
              <FaChevronLeft size={12} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', padding: '6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: '6px',
              color: 'var(--dg-text-muted)', transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dg-bg-hover)'; e.currentTarget.style.color = 'var(--dg-text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--dg-text-muted)'; }}
            title="Expand sidebar"
          >
            <FaChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="sidebar-content">
        {isOpen && (
          <div className="sidebar-category-header">MAIN NAVIGATION</div>
        )}
        <ul className="sidebar-menu-list">
          {mainMenuItems.map((item) => (
            <li className="menu-item-wrapper" key={item.name}>
              <Link 
                to={item.path} 
                className={`menu-item-link ${location.pathname === item.path ? 'active' : ''}`}
                title={!isOpen ? item.name : ''}
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-label">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-category-divider" />
        {isOpen && (
          <div className="sidebar-category-header">ADMINISTRATION</div>
        )}
        <ul className="sidebar-menu-list">
          {configMenuItems.map((item) => (
            <li className="menu-item-wrapper" key={item.name}>
              <Link 
                to={item.path} 
                className={`menu-item-link ${location.pathname === item.path ? 'active' : ''}`}
                title={!isOpen ? item.name : ''}
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-label">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Status card */}
        <div className="sidebar-status-box">
          <div className="status-dot-green" />
          <div className="status-box-content">
            <div className="status-box-title">DeskGuard Agent</div>
            <div className="status-box-subtitle">All systems operational</div>
          </div>
        </div>

        {/* Profile */}
        <div className="sidebar-profile-wrapper" ref={profileMenuRef}>
          <div 
            className="sidebar-profile-section" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={!isOpen ? (user?.name || 'Kiran Balaso Patil') : ''}
          >
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop" 
              alt="Avatar" 
              className="profile-avatar" 
            />
            <div className="profile-text-group">
              <div className="profile-name">
                {truncateText(user?.name || 'Kiran Balaso Patil', 16)}
              </div>
              <div className="profile-role">
                {role || 'Administrator'}
              </div>
            </div>
            <FaChevronDown className={`profile-chevron ${showProfileMenu ? 'rotate' : ''}`} />
          </div>

          {/* Dropdown */}
          {showProfileMenu && (
            <div className={`profile-dropdown-menu ${isOpen ? 'menu-open' : 'menu-collapsed'}`} style={{ width: isOpen ? '228px' : '160px' }}>
              <div className="profile-dropdown-theme-section">
                <div className="theme-switcher-label">Theme Mode</div>
                <div className="theme-switcher-pills">
                  <label className={`theme-switcher-pill ${theme === 'light' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="sidebar-theme" 
                      value="light" 
                      checked={theme === 'light'} 
                      onChange={() => setTheme('light')} 
                      style={{ display: 'none' }}
                    />
                    <span>Light</span>
                  </label>
                  <label className={`theme-switcher-pill ${theme === 'dark' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="sidebar-theme" 
                      value="dark" 
                      checked={theme === 'dark'} 
                      onChange={() => setTheme('dark')} 
                      style={{ display: 'none' }}
                    />
                    <span>Dark</span>
                  </label>
                </div>
              </div>
              <button className="profile-dropdown-item text-danger w-100 border-0" onClick={handleLogout} style={{ background: 'none' }}>
                <FaSignOutAlt className="me-2" style={{ fontSize: '0.85rem' }} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
