import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBuilding, FaUserCheck, FaPhoneAlt, FaEnvelope, FaLaptop, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSearch, 
  FaChevronRight, FaArrowLeft, FaServer, FaEye, FaSortAmountDown, FaMoon, FaWrench, FaBan, FaTrash, FaUserClock
} from 'react-icons/fa';
import { getCustomers, getCustomerById } from '../../services/customers';

const statusBadgeStyles = {
  Online: { bg: '#d4edda', text: '#155724', dot: '#28a745' },
  Offline: { bg: '#f8d7da', text: '#721c24', dot: '#dc3545' },
  Sleeping: { bg: '#e2e3e5', text: '#383d41', dot: '#6c757d' },
  Maintenance: { bg: '#fff3cd', text: '#856404', dot: '#ffc107' },
  Disabled: { bg: '#f8d7da', text: '#721c24', dot: '#6c757d' },
  Deleted: { bg: '#f8d7da', text: '#721c24', dot: '#000000' },
  Uninstalled: { bg: '#fff3cd', text: '#856404', dot: '#ffc107' },
  'Registration Pending': { bg: '#e0f7fa', text: '#006064', dot: '#00bcd4' },
  Unknown: { bg: '#e2e3e5', text: '#383d41', dot: '#9e9e9e' }
};

const AgentsList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('company_asc');

  // Customer Detail View State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomerGroups = async () => {
    setLoading(true);
    try {
      const res = await getCustomers({
        search: search.trim(),
        sortBy: sortBy,
        page: page,
        pageSize: 10
      });
      setCustomers(res.data || []);
      setTotalPages(res.lastPage || 1);
    } catch (err) {
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCustomerId) {
      fetchCustomerGroups();
    }
  }, [page, sortBy, selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomerId) {
      const timer = setTimeout(() => { setPage(1); fetchCustomerGroups(); }, 300);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const handleOpenCustomer = async (id) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    try {
      const res = await getCustomerById(id);
      setSelectedCustomer(res.data || res);
    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    fetchCustomerGroups();
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  // =========================================================================
  // VIEW B: CUSTOMER DETAILS VIEW (REGISTERED MACHINES FOR SPECIFIC CUSTOMER)
  // =========================================================================
  if (selectedCustomerId) {
    return (
      <div className="container-fluid p-0">
        {/* Navigation Back Header */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={handleBackToList}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            <FaArrowLeft /> Back to Company Groups
          </button>
          <span className="badge bg-primary text-wrap fs-6 px-3 py-2" style={{ borderRadius: '8px' }}>
            AMC Customer Systems Portal
          </span>
        </div>

        {loadingDetail || !selectedCustomer ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-2">Loading Customer Details & Machine Inventory...</p>
          </div>
        ) : (
          <>
            {/* Customer Summary Banner Card */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
              <div className="card-body p-4">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        <FaBuilding />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-1 text-white">{selectedCustomer.company_name}</h4>
                        <div className="d-flex flex-wrap gap-3 text-white-50 small">
                          <span><FaUserCheck className="me-1 text-info" /> {selectedCustomer.customer_name}</span>
                          <span><FaPhoneAlt className="me-1 text-success" /> {selectedCustomer.mobile_number}</span>
                          {selectedCustomer.email && <span><FaEnvelope className="me-1 text-warning" /> {selectedCustomer.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="row g-2 text-center">
                      <div className="col-3">
                        <div className="p-2 rounded bg-white bg-opacity-10">
                          <div className="fs-5 fw-bold text-white">{selectedCustomer.total_systems}</div>
                          <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Total Systems</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 rounded bg-success bg-opacity-20">
                          <div className="fs-5 fw-bold text-success-light" style={{ color: '#4ade80' }}>{selectedCustomer.online_systems}</div>
                          <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Online</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 rounded bg-danger bg-opacity-20">
                          <div className="fs-5 fw-bold text-danger-light" style={{ color: '#f87171' }}>{selectedCustomer.offline_systems}</div>
                          <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Offline</div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="p-2 rounded bg-warning bg-opacity-20">
                          <div className="fs-5 fw-bold text-warning-light" style={{ color: '#fbbf24' }}>{selectedCustomer.critical_alerts_count}</div>
                          <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Critical Alerts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Machines Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-dark">Registered Systems ({selectedCustomer.machines?.length || 0})</h6>
                <span className="text-muted small">Showing systems linked to {selectedCustomer.company_name}</span>
              </div>
              <div className="card-body p-0">
                {!selectedCustomer.machines || selectedCustomer.machines.length === 0 ? (
                  <div className="text-center py-5">
                    <FaLaptop className="text-muted mb-2" style={{ fontSize: '36px', opacity: 0.4 }} />
                    <p className="text-muted mb-0">No machines currently registered for this company.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Lifecycle Status</th>
                          <th>Hostname / Machine</th>
                          <th>Machine UID</th>
                          <th>IP Address</th>
                          <th>OS</th>
                          <th>Hardware Config</th>
                          <th>Last Seen</th>
                          <th className="pe-4 text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.machines.map(machine => {
                          const statusKey = machine.status || 'Unknown';
                          const style = statusBadgeStyles[statusKey] || statusBadgeStyles.Unknown;

                          return (
                            <tr key={machine.id}>
                              <td className="ps-4">
                                <span 
                                  className="badge px-3 py-2 d-inline-flex align-items-center gap-2"
                                  style={{ backgroundColor: style.bg, color: style.text, borderRadius: '20px', fontWeight: 600, fontSize: '0.78rem' }}
                                >
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: style.dot }} />
                                  {statusKey}
                                </span>
                              </td>
                              <td className="fw-semibold text-dark">
                                {machine.hostname || machine.device_name || 'Unnamed Machine'}
                              </td>
                              <td>
                                <code className="text-muted" style={{ fontSize: '0.78rem' }}>
                                  {machine.machine_uid ? `${machine.machine_uid.substring(0, 18)}...` : '—'}
                                </code>
                              </td>
                              <td className="text-muted">{machine.ip_address || '—'}</td>
                              <td className="small text-muted">{machine.operating_system || 'Windows 11'}</td>
                              <td className="small text-muted">
                                {machine.ram_gb ? `${machine.ram_gb} GB RAM` : '—'}
                              </td>
                              <td className="small text-muted">{formatLastSeen(machine.last_heartbeat_at)}</td>
                              <td className="pe-4 text-end">
                                <Link
                                  to={`/agents/${machine.id}`}
                                  className="btn btn-sm btn-outline-primary px-3"
                                  style={{ borderRadius: '6px' }}
                                >
                                  <FaEye className="me-1" /> View Machine
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW A: PRIMARY COMPANY / CUSTOMER GROUPINGS LIST
  // =========================================================================
  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            AMC Customer Company Groups
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>
            Manage monitored endpoints grouped automatically by AMC customer company name and contact mobile.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '14px', transform: 'translateY(-50%)', fontSize: '0.88rem' }} />
                <input
                  type="text"
                  className="form-control form-control-md"
                  placeholder="Search by Company, Customer Name, Mobile, Email, or Machine..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '38px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 d-flex justify-content-md-end align-items-center gap-2">
              <span className="text-muted small fw-semibold"><FaSortAmountDown className="me-1" /> Sort By:</span>
              <select 
                className="form-select form-select-md"
                style={{ width: 'auto', borderRadius: '8px', fontSize: '0.85rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="company_asc">Company Name (A-Z)</option>
                <option value="company_desc">Company Name (Z-A)</option>
                <option value="systems_desc">Most Systems</option>
                <option value="alerts_desc">Most Critical Alerts</option>
                <option value="last_active_desc">Recently Active</option>
                <option value="oldest">Oldest Created</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Company Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2">Loading Customer Groups...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '12px' }}>
          <FaBuilding className="text-muted mx-auto mb-3" style={{ fontSize: '48px', opacity: 0.3 }} />
          <h5 className="fw-bold mb-1">No AMC Customer Groups Found</h5>
          <p className="text-muted small">No customers match your search query or filter.</p>
        </div>
      ) : (
        <div className="row g-3">
          {customers.map((cust) => (
            <div className="col-12 col-md-6 col-lg-4" key={cust.id}>
              <div 
                className="card h-100 border-0 shadow-sm custom-company-card"
                onClick={() => handleOpenCustomer(cust.id)}
                style={{ 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  borderLeft: '4px solid #3b82f6'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="badge bg-light text-primary border mb-1" style={{ borderRadius: '4px', fontSize: '0.72rem' }}>
                          {cust.customer_code}
                        </span>
                        <h5 className="fw-bold text-dark mb-0">{cust.company_name}</h5>
                      </div>
                      <span className="badge bg-primary rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
                        {cust.total_systems} Systems
                      </span>
                    </div>

                    {/* Contact Information */}
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <div className="d-flex align-items-center gap-2 mb-1 small text-dark fw-medium">
                        <FaUserCheck className="text-primary" /> {cust.customer_name || 'Primary Contact'}
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-1 small text-muted">
                        <FaPhoneAlt className="text-success" /> {cust.mobile_number || 'N/A'}
                      </div>
                      {cust.email && (
                        <div className="d-flex align-items-center gap-2 small text-muted text-truncate">
                          <FaEnvelope className="text-warning" /> {cust.email}
                        </div>
                      )}
                    </div>

                    {/* Metrics Row */}
                    <div className="row g-2 text-center mb-3">
                      <div className="col-4">
                        <div className="p-2 border rounded bg-white">
                          <div className="fw-bold text-success">{cust.online_systems}</div>
                          <div className="text-muted" style={{ fontSize: '0.68rem' }}>Online</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-white">
                          <div className="fw-bold text-danger">{cust.offline_systems}</div>
                          <div className="text-muted" style={{ fontSize: '0.68rem' }}>Offline</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 border rounded bg-white">
                          <div className="fw-bold text-warning">{cust.critical_alerts_count}</div>
                          <div className="text-muted" style={{ fontSize: '0.68rem' }}>Alerts</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Active: {formatLastSeen(cust.last_activity_at)}
                    </span>
                    <span className="text-primary fw-bold small d-inline-flex align-items-center gap-1">
                      View Systems <FaChevronRight style={{ fontSize: '0.7rem' }} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && !loading && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="text-muted small">Page {page} of {totalPages}</span>
          <div className="dg-pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsList;
