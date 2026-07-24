import { memo, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaEllipsisV, 
  FaWindows, 
  FaLinux, 
  FaApple, 
  FaDesktop, 
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaFilter
} from 'react-icons/fa';

const MachineTable = memo(({ machines }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const items = Array.isArray(machines) ? machines : [];

  // Filter machines based on search query and status tab filter
  const filteredMachines = useMemo(() => {
    return items.filter(m => {
      const isOnlineStatus = m.status === 'Online' || m.is_online;
      const calculatedStatus = isOnlineStatus ? 'Online' : 'Offline';
      const matchesFilter = filter === 'All' || calculatedStatus === filter;
      
      const nameStr = m.device_name || m.hostname || m.name || '';
      const matchesSearch = nameStr.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / itemsPerPage));
  
  const paginatedMachines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMachines.slice(start, start + itemsPerPage);
  }, [filteredMachines, currentPage]);

  const getOsIcon = (os) => {
    const osLower = (os || '').toLowerCase();
    if (osLower.includes('win')) return <FaWindows style={{ color: '#0078D6', fontSize: '1.1rem' }} />;
    if (osLower.includes('ubuntu') || osLower.includes('lin')) return <FaLinux style={{ color: '#FCC624', fontSize: '1.1rem' }} />;
    if (osLower.includes('mac') || osLower.includes('apple')) return <FaApple style={{ color: '#000000', fontSize: '1.1rem' }} />;
    return <FaDesktop style={{ color: '#64748B', fontSize: '1.1rem' }} />;
  };

  const getIpAddress = (m) => {
    if (m.current_status?.network_interfaces?.[0]?.ip_address) {
      return m.current_status.network_interfaces[0].ip_address;
    }
    if (m.ip_address) return m.ip_address;
    return '—';
  };

  const getOsName = (m) => {
    if (m.operating_system) {
      let os = m.operating_system;
      if (!os.startsWith('Microsoft') && os.includes('Windows')) {
        os = 'Microsoft ' + os;
      }
      return os;
    }
    return '—';
  };

  const getFormattedHeartbeat = (m) => {
    if (m.last_heartbeat_at) {
      return new Date(m.last_heartbeat_at).toLocaleString();
    }
    return '—';
  };

  const getMetricColor = (val) => {
    if (val >= 90) return 'bg-danger';
    if (val >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      {/* Table Title, Search and Filter pills */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
        <h5 className="fw-bold mb-0 text-dark">Registered Systems</h5>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Search bar */}
          <div className="position-relative" style={{ minWidth: '220px' }}>
            <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '0.85rem' }} />
            <input 
              type="text" 
              className="form-control form-control-sm ps-4" 
              placeholder="Search systems..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', paddingLeft: '2rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
          {/* Filter tabs */}
          <div className="d-flex gap-1 bg-light p-1" style={{ borderRadius: '8px' }}>
            {['All', 'Online', 'Offline'].map(f => (
              <button 
                key={f}
                className={`btn btn-sm px-3 py-1 fw-bold ${filter === f ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                style={{ borderRadius: '6px', fontSize: '0.8rem', border: 'none' }}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Filter button icon */}
          <button className="btn btn-sm btn-light border" style={{ borderRadius: '8px', height: '38px', width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaFilter className="text-muted" />
          </button>
        </div>
      </div>

      {/* Table content */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
          <thead>
            <tr className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F1F5F9' }}>
              <th className="pb-3 border-0">Computer Name</th>
              <th className="pb-3 border-0">IP Address</th>
              <th className="pb-3 border-0">Operating System</th>
              <th className="pb-3 border-0">Status</th>
              <th className="pb-3 border-0">CPU Usage</th>
              <th className="pb-3 border-0">RAM Usage</th>
              <th className="pb-3 border-0">Disk Usage</th>
              <th className="pb-3 border-0">Last Heartbeat</th>
              <th className="pb-3 border-0 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMachines.length > 0 ? (
              paginatedMachines.map((m, idx) => {
                const isOnlineStatus = m.status === 'Online' || m.is_online;
                const calculatedStatus = isOnlineStatus ? 'Online' : 'Offline';
                const cpuVal = m.current_status?.cpu_percentage ?? null;
                const ramVal = m.current_status?.ram_percentage ?? null;
                const diskVal = m.current_status?.disk_percentage ?? null;

                return (
                  <tr key={m.id || idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    {/* Computer Name */}
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: calculatedStatus === 'Online' ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                        <div className="d-flex align-items-center gap-2">
                          {getOsIcon(m.operating_system)}
                          <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{m.device_name || m.hostname || m.machine_uid || '—'}</span>
                        </div>
                      </div>
                    </td>
                    {/* IP Address */}
                    <td className="py-3 text-muted" style={{ fontSize: '0.85rem' }}>{getIpAddress(m)}</td>
                    {/* OS */}
                    <td className="py-3 text-muted" style={{ fontSize: '0.85rem' }}>{getOsName(m)}</td>
                    {/* Status Badge */}
                    <td className="py-3">
                      <span 
                        className={`badge px-2.5 py-1.5 fw-bold`} 
                        style={{ 
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: calculatedStatus === 'Online' ? '#EBFDF5' : '#FDF2F2',
                          color: calculatedStatus === 'Online' ? '#10B981' : '#EF4444'
                        }}
                      >
                        {calculatedStatus}
                      </span>
                    </td>
                    {/* CPU Progress Bar */}
                    <td className="py-3">
                      <div className="d-flex flex-column" style={{ width: '80px' }}>
                        <span className="fw-semibold text-dark mb-1" style={{ fontSize: '0.75rem' }}>{cpuVal !== null ? `${cpuVal}%` : '—'}</span>
                        {cpuVal !== null && (
                          <div className="progress" style={{ height: '4px', borderRadius: '10px', backgroundColor: '#F1F5F9' }}>
                            <div className={`progress-bar ${getMetricColor(cpuVal)}`} style={{ width: `${cpuVal}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* RAM Progress Bar */}
                    <td className="py-3">
                      <div className="d-flex flex-column" style={{ width: '80px' }}>
                        <span className="fw-semibold text-dark mb-1" style={{ fontSize: '0.75rem' }}>{ramVal !== null ? `${ramVal}%` : '—'}</span>
                        {ramVal !== null && (
                          <div className="progress" style={{ height: '4px', borderRadius: '10px', backgroundColor: '#F1F5F9' }}>
                            <div className={`progress-bar ${getMetricColor(ramVal)}`} style={{ width: `${ramVal}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Disk Progress Bar */}
                    <td className="py-3">
                      <div className="d-flex flex-column" style={{ width: '80px' }}>
                        <span className="fw-semibold text-dark mb-1" style={{ fontSize: '0.75rem' }}>{diskVal !== null ? `${diskVal}%` : '—'}</span>
                        {diskVal !== null && (
                          <div className="progress" style={{ height: '4px', borderRadius: '10px', backgroundColor: '#F1F5F9' }}>
                            <div className={`progress-bar ${getMetricColor(diskVal)}`} style={{ width: `${diskVal}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Last Heartbeat */}
                    <td className="py-3 text-muted" style={{ fontSize: '0.75rem' }}>{getFormattedHeartbeat(m)}</td>
                    {/* Actions cell shortcuts */}
                    <td className="py-3 text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button 
                          className="btn btn-sm btn-link p-1 text-muted" 
                          title="View Details"
                          onClick={() => navigate(`/machines/${m.id}`)}
                          style={{ transition: 'color 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.color = '#0D6EFD' }}
                          onMouseOut={(e) => { e.currentTarget.style.color = '#64748B' }}
                        >
                          <FaDesktop />
                        </button>
                        <button 
                          className="btn btn-sm btn-link p-1 text-muted" 
                          title="Charts"
                          onClick={() => navigate(`/machines/${m.id}`)}
                          style={{ transition: 'color 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.color = '#0D6EFD' }}
                          onMouseOut={(e) => { e.currentTarget.style.color = '#64748B' }}
                        >
                          <FaChartLine />
                        </button>
                        <button className="btn btn-sm btn-link p-1 text-muted">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>No matching registered systems found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top" style={{ borderColor: '#F1F5F9' }}>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMachines.length)} of {filteredMachines.length} systems
          </div>
          <div className="d-flex gap-1.5 align-items-center">
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', padding: 0 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <FaChevronLeft style={{ fontSize: '0.75rem' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  border: currentPage === page ? 'none' : '1px solid #E2E8F0', 
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  padding: 0
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', padding: 0 }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <FaChevronRight style={{ fontSize: '0.75rem' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default MachineTable;
