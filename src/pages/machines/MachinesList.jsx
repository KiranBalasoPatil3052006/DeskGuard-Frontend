import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaServer, 
  FaCheckCircle, 
  FaMicrochip,
  FaMemory,
  FaEllipsisH,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaWindows,
  FaLinux,
  FaApple,
  FaDesktop,
  FaClock,
  FaEllipsisV,
  FaMinus,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaPlus,
  FaEye,
  FaFileAlt,
  FaExchangeAlt,
  FaDownload,
  FaRobot,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';
import { useMachines } from '../../hooks/useQueries';
import SummaryCards from '../../components/dashboard/SummaryCards';
import './MachinesList.css';

const HealthRing = ({ score }) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  let strokeColor = '#10B981'; // Green
  if (score < 50) strokeColor = '#EF4444'; // Red
  else if (score < 80) strokeColor = '#F97316'; // Orange

  return (
    <div className="health-ring-wrapper">
      <svg width="34" height="34">
        <circle
          cx="17"
          cy="17"
          r={radius}
          fill="transparent"
          stroke="#E2E8F0"
          strokeWidth="2.5"
        />
        <circle
          cx="17"
          cy="17"
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 17 17)"
        />
      </svg>
      <span className="health-ring-text" style={{ color: strokeColor }}>{score}</span>
    </div>
  );
};

const RadialGauge = ({ value }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="radial-gauge-wrapper">
      <svg width="50" height="50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="transparent"
          stroke="#F1F5F9"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="transparent"
          stroke="#10B981"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
        />
      </svg>
      <span className="radial-gauge-text">{value}%</span>
    </div>
  );
};

const MachinesList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [osFilter, setOsFilter] = useState('All OS');
  const [sortBy, setSortBy] = useState('Health Score');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch, osFilter, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const params = { page: currentPage, per_page: itemsPerPage };
  if (filter === 'Offline') params.status = 'offline';
  else if (filter === 'Healthy' || filter === 'Online') params.status = 'online';
  if (debouncedSearch) params.search = debouncedSearch;

  const { data: machinesData, isLoading: loading } = useMachines(params);
  const dbMachines = machinesData?.data || [];
  const meta = machinesData?.meta || {};

  const calculateHealthScore = (m) => {
    const cs = m.current_status || {};
    if (cs.health_score != null) return cs.health_score;
    let score = 100;
    const cpu = cs.cpu_percentage ?? 0;
    const ram = cs.ram_percentage ?? 0;
    const disk = cs.disk_percentage ?? 0;
    if (cpu > 90) score -= 30; else if (cpu > 70) score -= 15;
    if (ram > 90) score -= 25; else if (ram > 70) score -= 10;
    if (disk > 90) score -= 20; else if (disk > 70) score -= 5;
    return Math.max(0, Math.min(100, score));
  };

  const getStatus = (m, score) => {
    if (!m.is_online) {
      return 'Offline';
    }
    if (score < 50) return 'Critical';
    if (score < 80) return 'Warning';
    return 'Online';
  };

  const getUserName = (m) => {
    if (m.assigned_user?.name) return m.assigned_user.name;
    return m.employee_mobile_number || '—';
  };

  const formatOs = (os) => {
    if (!os) return { name: '—', version: '' };
    let cleanOs = os.replace('Microsoft ', '').replace('Language ', '');
    if (cleanOs.includes('Windows 11')) {
      return { name: 'Windows 11', version: cleanOs.replace('Windows 11 ', '') || 'Pro' };
    }
    if (cleanOs.includes('Windows 10')) {
      return { name: 'Windows 10', version: cleanOs.replace('Windows 10 ', '') || 'Pro' };
    }
    if (cleanOs.includes('Ubuntu')) {
      return { name: 'Ubuntu', version: cleanOs.replace('Ubuntu ', '') || 'LTS' };
    }
    return { name: cleanOs, version: '' };
  };

  // Filter DB Machines dynamically
  const displayMachines = useMemo(() => {
    let resultList = [...dbMachines];

    if (debouncedSearch) {
      resultList = resultList.filter(m => 
        (m.device_name || m.hostname || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        getUserName(m).toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (osFilter !== 'All OS') {
      resultList = resultList.filter(m => 
        (m.operating_system || '').toLowerCase().includes(osFilter.toLowerCase())
      );
    }

    if (filter !== 'All') {
      resultList = resultList.filter((m) => {
        const score = calculateHealthScore(m);
        const status = getStatus(m, score);
        if (filter === 'Healthy') return status === 'Online';
        return status === filter;
      });
    }

    // Apply sorting
    resultList.sort((a, b) => {
      const scoreA = calculateHealthScore(a);
      const scoreB = calculateHealthScore(b);
      if (sortBy === 'Health Score') return scoreB - scoreA;
      if (sortBy === 'CPU') return (b.current_status?.cpu_percentage ?? 0) - (a.current_status?.cpu_percentage ?? 0);
      if (sortBy === 'RAM') return (b.current_status?.ram_percentage ?? 0) - (a.current_status?.ram_percentage ?? 0);
      return 0;
    });

    return resultList;
  }, [dbMachines, debouncedSearch, filter, osFilter, sortBy]);

  const summary = {
    total: meta?.total ?? dbMachines.length,
    online: meta?.online_count ?? dbMachines.filter(m => m.is_online).length,
    offline: meta?.offline_count ?? dbMachines.filter(m => !m.is_online).length,
    critical: meta?.critical_count ?? dbMachines.filter(m => calculateHealthScore(m) < 50).length,
  };

  const relativeTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getOsIcon = (os) => {
    const osLower = (os || '').toLowerCase();
    if (osLower.includes('win')) return <FaWindows style={{ color: '#0078D6' }} />;
    if (osLower.includes('ubuntu') || osLower.includes('lin')) return <FaLinux style={{ color: '#FCC624' }} />;
    if (osLower.includes('mac') || osLower.includes('apple')) return <FaApple style={{ color: '#000000' }} />;
    return <FaDesktop style={{ color: '#64748B' }} />;
  };

  const getMetricColor = (val) => {
    if (val >= 90) return 'bar-red';
    if (val >= 70) return 'bar-orange';
    return 'bar-green';
  };

  // Pagination calculations
  const totalPages = Math.ceil(displayMachines.length / itemsPerPage);
  const paginatedMachines = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return displayMachines.slice(startIdx, startIdx + itemsPerPage);
  }, [displayMachines, currentPage]);

  return (
    <div className="machines-container">
      <div className="row g-4">
        {/* Main Column */}
        <div className="col-12 d-flex flex-column gap-4">
          
          {/* Header */}
          <div className="machines-header-section">
            <div>
              <h3 className="machines-header-title">Machines</h3>
              <p className="machines-header-subtitle">Monitor and manage all your connected computers in real time.</p>
            </div>
            <div className="header-actions-group">
              <button className="add-machine-primary-btn header-btn">
                <span>+ Add Machine</span>
              </button>
              
              <div className="quick-actions-dropdown-wrapper" ref={quickActionsRef}>
                <button 
                  className="quick-actions-dropdown-btn" 
                  onClick={() => setShowQuickActions(!showQuickActions)}
                >
                  <span>Quick Actions</span>
                  <FaChevronDown style={{ fontSize: '0.75rem' }} />
                </button>
                
                {showQuickActions && (
                  <div className="quick-actions-dropdown-menu">
                    <button className="quick-dropdown-item" onClick={() => { setFilter('Offline'); setShowQuickActions(false); }}>
                      <FaEye className="quick-action-icon" />
                      <span>View Offline Machines</span>
                    </button>
                    <button className="quick-dropdown-item" onClick={() => { navigate('/reports'); setShowQuickActions(false); }}>
                      <FaFileAlt className="quick-action-icon" />
                      <span>Generate Report</span>
                    </button>
                    <button className="quick-dropdown-item" onClick={() => { navigate('/changes'); setShowQuickActions(false); }}>
                      <FaExchangeAlt className="quick-action-icon" />
                      <span>Hardware Changes</span>
                    </button>
                    <button className="quick-dropdown-item" onClick={() => { alert('Exporting machine list as CSV...'); setShowQuickActions(false); }}>
                      <FaDownload className="quick-action-icon" />
                      <span>Export Machine List</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top 6 Summary Cards */}
          <SummaryCards data={{ cards: { total_machines: summary.total, online_count: summary.online, offline_count: summary.offline, critical_alerts: summary.critical, hardware_changes_count: 7 } }} />


          {/* Main Card */}
          <div className="card mb-4">
            {/* Filter and Search Bar */}
            <div className="card-body border-bottom border-light py-3">
              <div className="d-flex flex-column flex-xl-row justify-content-between align-items-stretch align-items-xl-center gap-3">
                {/* Search */}
                <div className="position-relative" style={{ width: '100%', maxWidth: '280px' }}>
                  <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '0.82rem' }} />
                  <input 
                    type="text" 
                    placeholder="Search machines..." 
                    className="form-control form-control-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                </div>

                {/* Filter Pills */}
                <div className="pill-group flex-wrap">
                  <button className={`pill-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
                    All <span className="badge bg-secondary bg-opacity-10 text-muted ms-1" style={{ fontSize: '0.65rem' }}>{summary.total}</span>
                  </button>
                  <button className={`pill-btn ${filter === 'Healthy' ? 'active' : ''}`} onClick={() => setFilter('Healthy')}>
                    <span className="status-dot online me-1" />
                    Healthy <span className="badge bg-success bg-opacity-10 text-success ms-1" style={{ fontSize: '0.65rem' }}>{summary.total - summary.offline - summary.critical}</span>
                  </button>
                  <button className={`pill-btn ${filter === 'Warning' ? 'active' : ''}`} onClick={() => setFilter('Warning')}>
                    <span className="status-dot warning me-1" />
                    Warning <span className="badge bg-warning bg-opacity-10 text-warning ms-1" style={{ fontSize: '0.65rem' }}>18</span>
                  </button>
                  <button className={`pill-btn ${filter === 'Critical' ? 'active' : ''}`} onClick={() => setFilter('Critical')}>
                    <span className="status-dot offline me-1" />
                    Critical <span className="badge bg-danger bg-opacity-10 text-danger ms-1" style={{ fontSize: '0.65rem' }}>{summary.critical}</span>
                  </button>
                  <button className={`pill-btn ${filter === 'Offline' ? 'active' : ''}`} onClick={() => setFilter('Offline')}>
                    <span className="status-dot offline me-1" style={{ backgroundColor: 'var(--dg-text-muted)' }} />
                    Offline <span className="badge bg-secondary bg-opacity-10 text-muted ms-1" style={{ fontSize: '0.65rem' }}>{summary.offline}</span>
                  </button>
                </div>

                {/* Dropdowns */}
                <div className="d-flex align-items-center gap-2">
                  <select className="form-select form-select-sm" value={osFilter} onChange={(e) => setOsFilter(e.target.value)} style={{ width: '120px' }}>
                    <option value="All OS">All OS</option>
                    <option value="Windows">Windows</option>
                    <option value="Ubuntu">Ubuntu</option>
                  </select>

                  <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '160px' }}>
                    <option value="Health Score">Sort: Health Score</option>
                    <option value="CPU">Sort: CPU Usage</option>
                    <option value="RAM">Sort: RAM Usage</option>
                  </select>

                  <button className="btn btn-outline-secondary btn-sm" style={{ padding: '6px 10px' }}><FaExchangeAlt size={12} /></button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="card-body p-0">
              {loading && paginatedMachines.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border text-primary" role="status" />
                  <div className="mt-2 small">Loading monitored machines...</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">Machine / User</th>
                        <th>OS</th>
                        <th>Health Score</th>
                        <th>Status</th>
                        <th>CPU</th>
                        <th>RAM</th>
                        <th>Storage</th>
                        <th>Last Heartbeat</th>
                        <th className="pe-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMachines.length > 0 ? (
                        paginatedMachines.map((m, idx) => {
                          const score = calculateHealthScore(m);
                          const status = getStatus(m, score);
                          
                          const cpu = m.current_status?.cpu_percentage ?? null;
                          const ram = m.current_status?.ram_percentage ?? null;
                          const disk = m.current_status?.disk_percentage ?? null;
                          
                          const osInfo = formatOs(m.operating_system);

                          return (
                            <tr key={m.id || idx}>
                              <td className="ps-4">
                                <div className="d-flex align-items-center gap-2.5">
                                  <div className="text-muted d-flex align-items-center" style={{ fontSize: '1.25rem' }}>
                                    {getOsIcon(m.operating_system)}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                                      {m.device_name || m.hostname || m.machine_uid || '—'}
                                    </div>
                                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                      {getUserName(m)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="small">
                                  <div className="fw-semibold text-dark">{osInfo.name}</div>
                                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{osInfo.version}</div>
                                </div>
                              </td>
                              <td>
                                <HealthRing score={score} />
                              </td>
                              <td>
                                <span className={`badge ${
                                  status === 'Healthy' ? 'badge-online' : status === 'Critical' ? 'badge-critical' : 'badge-warning'
                                }`}>
                                  <span className={`status-dot ${
                                    status === 'Healthy' ? 'online' : status === 'Critical' ? 'offline' : 'warning'
                                  }`} />
                                  {status}
                                </span>
                              </td>
                              <td>
                                <div style={{ minWidth: '80px' }}>
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{cpu !== null ? `${cpu}%` : '—'}</span>
                                  </div>
                                  {cpu !== null && (
                                    <div className="progress" style={{ height: '4px' }}>
                                      <div 
                                        className={`progress-bar ${cpu > 80 ? 'bg-danger' : cpu > 60 ? 'bg-warning' : 'bg-primary'}`} 
                                        style={{ width: `${cpu}%` }} 
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: '80px' }}>
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{ram !== null ? `${ram}%` : '—'}</span>
                                  </div>
                                  {ram !== null && (
                                    <div className="progress" style={{ height: '4px' }}>
                                      <div 
                                        className={`progress-bar ${ram > 80 ? 'bg-danger' : ram > 60 ? 'bg-warning' : 'bg-primary'}`} 
                                        style={{ width: `${ram}%` }} 
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: '80px' }}>
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{disk !== null ? `${disk}%` : '—'}</span>
                                  </div>
                                  {disk !== null && (
                                    <div className="progress" style={{ height: '4px' }}>
                                      <div 
                                        className={`progress-bar ${disk > 80 ? 'bg-danger' : disk > 60 ? 'bg-warning' : 'bg-primary'}`} 
                                        style={{ width: `${disk}%` }} 
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1.5">
                                  <span className={`status-dot ${status === 'Offline' ? 'offline' : 'online'}`} />
                                  <span className="small">{relativeTime(m.last_heartbeat_at)}</span>
                                </div>
                              </td>
                              <td className="pe-4 text-end" onClick={e => e.stopPropagation()}>
                                <div className="d-inline-flex gap-2 align-items-center justify-content-end">
                                  <button className="action-btn" title="View details" onClick={() => navigate(`/machines/${m.id || idx}`)}>
                                    <FaDesktop />
                                  </button>
                                  <button className="action-btn" title="Inspect Timeline" onClick={() => navigate(`/changes`)}>
                                    <FaClock />
                                  </button>
                                  <div className="position-relative">
                                    <button className="action-btn" onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}>
                                      <FaEllipsisV />
                                    </button>
                                    {openDropdown === idx && (
                                      <div 
                                        className="dropdown-menu show position-absolute end-0 mt-1 shadow border" 
                                        style={{ zIndex: 1000, minWidth: '150px' }}
                                        ref={dropdownRef}
                                      >
                                        <button 
                                          className="dropdown-item fw-semibold py-2" 
                                          onClick={() => {
                                            setOpenDropdown(null);
                                            navigate(`/machines/${m.id}`);
                                          }}
                                          style={{ fontSize: '0.8rem' }}
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center py-5 text-muted">
                            No machines matching your search or filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="card-footer bg-transparent border-top border-light d-flex justify-content-between align-items-center py-3">
                <span className="text-muted small">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayMachines.length)} of {displayMachines.length} machines
                </span>
                <div className="dg-pagination">
                  <button 
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

// Heart icon placeholder
const FaHeartbeatIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);

export default MachinesList;
