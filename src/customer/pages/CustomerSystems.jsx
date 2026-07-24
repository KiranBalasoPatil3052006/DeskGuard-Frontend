import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaDesktop,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaWindows,
  FaLinux,
  FaApple,
  FaChevronLeft,
  FaChevronRight,
  FaSync
} from 'react-icons/fa';
import { getCustomerSystems } from '../services/customerApi';

const CustomerSystems = () => {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  const fetchSystems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCustomerSystems({
        page,
        per_page: 12,
        search,
        status: statusFilter,
        sort_by: sortBy
      });
      const data = res?.data?.data || res?.data || res || [];
      const paginationMeta = res?.data?.meta || res?.meta || { currentPage: page, totalPages: 1, totalCount: data.length };
      setSystems(Array.isArray(data) ? data : []);
      setMeta(paginationMeta);
    } catch (err) {
      setError(err?.message || 'Failed to load systems.');
      setSystems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [page, statusFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSystems();
  };

  const getOsIcon = (os) => {
    const osLower = (os || '').toLowerCase();
    if (osLower.includes('win')) return <FaWindows style={{ color: '#0078D6' }} />;
    if (osLower.includes('ubuntu') || osLower.includes('lin')) return <FaLinux style={{ color: '#FCC624' }} />;
    if (osLower.includes('mac') || osLower.includes('apple')) return <FaApple style={{ color: '#000000' }} />;
    return <FaDesktop style={{ color: '#64748B' }} />;
  };

  const getHealthBadge = (score) => {
    if (score >= 90) return <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2 py-1"><FaCheckCircle className="me-1" />{score}% Excellent</span>;
    if (score >= 75) return <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-2 py-1"><FaExclamationTriangle className="me-1" />{score}% Warning</span>;
    return <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 px-2 py-1"><FaTimesCircle className="me-1" />{score}% Critical</span>;
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Systems</h4>
          <p className="text-muted small mb-0">Monitor operational status and health of systems covered under your AMC.</p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          onClick={fetchSystems}
          disabled={loading}
        >
          <FaSync className={loading ? 'spin-icon' : ''} /> Refresh
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '12px' }}>
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search machine name, OS, or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <FaFilter />
              </span>
              <select
                className="form-select bg-light"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="All">All Statuses</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <FaSortAmountDown />
              </span>
              <select
                className="form-select bg-light"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="last_seen_desc">Last Seen (Newest)</option>
                <option value="last_seen_asc">Last Seen (Oldest)</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger py-2 small mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading systems...</span>
          </div>
        </div>
      ) : systems.length > 0 ? (
        <>
          {/* Systems Card Grid */}
          <div className="row g-3 mb-4">
            {systems.map((m) => (
              <div key={m.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <div
                  className="card border-0 shadow-sm p-3 h-100 position-relative cursor-pointer"
                  style={{ borderRadius: '12px', transition: 'box-shadow 0.2s' }}
                  onClick={() => navigate(`/customer/systems/${m.id}`)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-2 bg-light">
                        {getOsIcon(m.operatingSystem)}
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{m.computerName}</h6>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>{m.operatingSystem || 'Windows OS'}</span>
                      </div>
                    </div>
                    <span className={`badge ${m.status === 'Online' ? 'bg-success' : 'bg-secondary'} rounded-pill px-2`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between my-2 py-2 border-top border-bottom">
                    <span className="small text-muted">Health Score</span>
                    {getHealthBadge(m.healthScore || 96)}
                  </div>

                  <div className="small text-muted d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                    <span>User: <strong>{m.assignedUser}</strong></span>
                    <span>{m.lastSeen ? new Date(m.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm">
              <span className="small text-muted">
                Showing Page <strong>{meta.currentPage}</strong> of <strong>{meta.totalPages}</strong> ({meta.totalCount} Systems)
              </span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <FaChevronLeft /> Prev
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5 card border-0 shadow-sm p-4">
          <FaDesktop className="fs-1 text-muted opacity-50 mb-2" />
          <h6 className="fw-bold text-dark">No systems found</h6>
          <p className="text-muted small mb-0">No computers match your current search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerSystems;
