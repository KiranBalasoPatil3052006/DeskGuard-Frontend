import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaBell, FaBars, FaCheckDouble } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getUnreadNotificationCount, getNotifications, markAllNotificationsAsRead } from '../../services/notifications';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/machines': 'Machines',
  '/agents': 'Agents',
  '/reports': 'Reports',
  '/alerts': 'Alerts',
  '/changes': 'Changes',
  '/accounts': 'Accounts',
  '/settings': 'Settings',
  '/settings/alert-thresholds': 'Alert Thresholds',
};

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const currentPageTitle = PAGE_TITLES[location.pathname] || 'DeskGuard';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.count ?? res.data?.count ?? 0);
    } catch {
      // silently fail
    }
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({ per_page: 5 });
      const list = res.data?.data ?? res.data ?? [];
      setRecentNotifications(list);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (showDropdown) fetchRecentNotifications();
  }, [showDropdown, fetchRecentNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = (e) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setRecentNotifications([]);
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = (notification) => {
    setShowDropdown(false);
    if (notification?.id) {
      navigate(`/alerts?id=${notification.id}`);
    } else {
      navigate('/alerts');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <nav 
      className="top-navbar d-flex align-items-center justify-content-between px-4"
      style={{ 
        background: 'var(--dg-white)', 
        borderBottom: '1px solid var(--dg-border)', 
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 900
      }}
    >
      {/* Left side: Mobile toggle + Page Title */}
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-link d-md-none p-0" 
          onClick={toggleSidebar}
          style={{ color: 'var(--dg-text-secondary)', fontSize: '1.1rem' }}
        >
          <FaBars />
        </button>
        <h4 style={{ 
          margin: 0, 
          fontSize: '1rem', 
          fontWeight: 600, 
          color: 'var(--dg-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          {currentPageTitle}
        </h4>
      </div>

      {/* Right side: Search + Notifications */}
      <div className="d-flex align-items-center gap-3">
        {/* Search */}
        <div className="d-flex align-items-center position-relative">
          {showSearch && (
            <input
              ref={searchRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ 
                width: '220px', 
                fontSize: '0.8rem',
                marginRight: '8px',
                background: 'var(--dg-gray-50)',
                border: '1px solid var(--dg-border)'
              }}
              autoFocus
              onBlur={(e) => {
                if (e.target.value === '') setShowSearch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setShowSearch(false); setSearchValue(''); }
              }}
            />
          )}
          <button 
            onClick={() => { setShowSearch(!showSearch); }}
            style={{
              background: 'none', border: 'none', padding: '6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: 'var(--dg-text-muted)', borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dg-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dg-text-muted)'}
            title="Search"
          >
            <FaSearch size={15} />
          </button>
        </div>

        {/* Notifications */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            style={{
              background: 'none', border: 'none', padding: '6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: 'var(--dg-text-muted)', borderRadius: '6px',
              transition: 'all 0.15s', position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dg-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dg-text-muted)'}
            title="Notifications"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: 'var(--dg-danger)', color: 'white',
                fontSize: '0.6rem', fontWeight: 700,
                minWidth: '16px', height: '16px',
                borderRadius: '99px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', transform: 'translate(4px, -4px)',
                border: '2px solid var(--dg-white)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '8px',
              width: '340px', zIndex: 1050,
              background: 'var(--dg-white)',
              borderRadius: 'var(--dg-radius-lg)',
              boxShadow: 'var(--dg-shadow-lg)',
              border: '1px solid var(--dg-border)',
              overflow: 'hidden'
            }}>
              <div className="d-flex align-items-center justify-content-between px-3 py-2" 
                style={{ borderBottom: '1px solid var(--dg-border-light)' }}>
                <span style={{ fontWeight: 600, color: 'var(--dg-text-primary)', fontSize: '0.85rem' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button 
                    className="btn btn-sm btn-link text-decoration-none p-0" 
                    onClick={handleMarkAllRead} 
                    style={{ color: 'var(--dg-success)', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <FaCheckDouble className="me-1" size={10} />Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-4" style={{ color: 'var(--dg-text-muted)', fontSize: '0.8rem' }}>
                    No notifications
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-3 py-2 cursor-pointer"
                      style={{ 
                        borderBottom: '1px solid var(--dg-border-light)', 
                        transition: 'background 0.1s',
                        ...(n.is_read ? {} : { background: 'var(--dg-primary-light)' })
                      }}
                      onClick={() => handleNotificationClick(n)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dg-bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? '' : 'var(--dg-primary-light)'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--dg-text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dg-text-muted)' }} className="text-truncate">{n.body}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--dg-gray-400)', marginTop: '2px' }}>{formatTime(n.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
              {recentNotifications.length > 0 && (
                <div className="text-center py-2" style={{ borderTop: '1px solid var(--dg-border-light)' }}>
                  <button 
                    className="btn btn-sm btn-link text-decoration-none" 
                    onClick={() => { setShowDropdown(false); navigate('/alerts'); }} 
                    style={{ color: 'var(--dg-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    View all alerts →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar (visible on desktop) */}
        <div className="d-none d-md-flex align-items-center" style={{ gap: '10px' }}>
          <div style={{
            width: '1px', height: '24px', background: 'var(--dg-border)', marginRight: '4px'
          }} />
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop" 
            alt="Avatar" 
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              objectFit: 'cover', border: '2px solid var(--dg-border)'
            }}
          />
          <div className="text-start" style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--dg-text-primary)' }}>
              {user?.name || 'Admin User'}
            </div>
            {user?.roles?.length > 0 && (
              <div style={{ fontSize: '0.65rem', color: 'var(--dg-text-muted)' }}>
                {typeof user.roles[0] === 'object' ? user.roles[0]?.name : user.roles[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
