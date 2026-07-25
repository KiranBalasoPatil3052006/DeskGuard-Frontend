import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerSystems } from '../services/customerApi';
import {
  FaSearch,
  FaDesktop,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaChevronRight,
  FaClock,
  FaFilter
} from 'react-icons/fa';

const CustomerSystems = () => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSystems = async () => {
      setLoading(true);
      try {
        const res = await getCustomerSystems({ search, status: filter !== 'All' ? filter : undefined });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSystems(list);
      } catch (err) {
        console.error('Failed to load customer systems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
  }, [filter]);

  // Client-side search filtering
  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      const matchSearch =
        !search ||
        s.computer_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.operating_system?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || s.status?.toLowerCase() === filter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [systems, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredSystems.length / itemsPerPage));
  const paginatedSystems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSystems.slice(start, start + itemsPerPage);
  }, [filteredSystems, currentPage]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
        return <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold"><FaCheckCircle className="me-1" /> Healthy</span>;
      case 'warning':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold"><FaExclamationTriangle className="me-1" /> Warning</span>;
      case 'critical':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold"><FaTimesCircle className="me-1" /> Critical</span>;
      case 'offline':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle fw-bold"><FaDesktop className="me-1" /> Offline</span>;
      default:
        return <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold">Healthy</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title & Description */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            My Registered Systems
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, marginTop: '4px' }}>
            All computers registered under your company AMC account are automatically listed below.
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Search Box */}
          <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search computer name or OS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '38px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1'
              }}
            />
            <FaSearch
              style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div className="d-flex align-items-center gap-1 flex-wrap">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '6px' }} className="d-none d-lg-inline">
              <FaFilter /> Filter:
            </span>
            {['All', 'Healthy', 'Warning', 'Critical', 'Offline'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: filter === f ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: filter === f ? '#2563eb' : '#ffffff',
                  color: filter === f ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Systems...</span>
          </div>
        </div>
      ) : paginatedSystems.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <FaDesktop size={42} style={{ color: '#cbd5e1' }} className="mb-3" />
          <h5 style={{ fontWeight: 700, color: '#0f172a' }}>No Systems Found</h5>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            No registered systems match your search filter. Try clearing your search term or selecting "All".
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {paginatedSystems.map((sys) => (
            <div key={sys.id} className="col-12 col-md-6 col-xl-4 col-xxl-3">
              <div
                onClick={() => navigate(`/customer/systems/${sys.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Card Top Header */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}
                    >
                      <FaDesktop />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                        {sys.computer_name}
                      </h5>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{sys.operating_system}</span>
                    </div>
                  </div>
                  {getStatusBadge(sys.status)}
                </div>

                {/* Health Score Progress Bar */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Health Score</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: sys.health_score >= 80 ? '#10b981' : sys.health_score >= 60 ? '#f59e0b' : '#f43f5e' }}>
                      {sys.health_score}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '7px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${sys.health_score}%`,
                        backgroundColor: sys.health_score >= 80 ? '#10b981' : sys.health_score >= 60 ? '#f59e0b' : '#f43f5e',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Footer Info & Arrow */}
                <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  <span className="d-flex align-items-center gap-1">
                    <FaClock style={{ color: '#94a3b8' }} />
                    {sys.is_online ? 'Active Now' : 'Last Seen Recently'}
                  </span>
                  <span style={{ color: '#2563eb', fontWeight: 700 }} className="d-flex align-items-center gap-1">
                    View Details <FaChevronRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center pt-2">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredSystems.length} Total Systems)
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSystems;
